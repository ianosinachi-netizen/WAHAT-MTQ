import React, { useState } from "react";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2, Edit2, Trash2, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const AdminPanel = () => {
  const { t } = useLanguage();
  const { profile, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'upload' | 'manage'>('upload');
  const [uploadType, setUploadType] = useState<'products' | 'page_content' | 'gallery' | 'services' | 'testimonials' | 'barite_properties' | 'barite_applications'>('products');
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmGalleryDeleteUrl, setConfirmGalleryDeleteUrl] = useState<string | null>(null);
  const [confirmClearGallery, setConfirmClearGallery] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  
  const [sectionId, setSectionId] = useState("barite-hero");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [icon, setIcon] = useState("Beaker");
  const [details, setDetails] = useState("");
  const [company, setCompany] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [currentGallery, setCurrentGallery] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-teal-600" size={48} />
    </div>
  );

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Access Denied')}</h2>
          <p className="text-gray-500 font-medium">{t('Admin privileges are required to access this panel.')}</p>
        </div>
      </div>
    );
  }

  // Handle file selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t("Please select an image file."));
      return;
    }
    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      let q;
      if (uploadType === 'page_content') {
        // Page content often has custom IDs and might lack timestamps
        q = query(collection(db, uploadType));
      } else {
        q = query(collection(db, uploadType), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      let fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));

      // Manual sort for page_content if needed, or just leave as is
      if (uploadType === 'page_content') {
        fetchedItems.sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      }

      setItems(fetchedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      handleFirestoreError(err, OperationType.LIST, uploadType);
    } finally {
      setLoadingItems(false);
    }
  };

  React.useEffect(() => {
    if (mode === 'manage') {
      fetchItems();
    }
  }, [mode, uploadType]);

  // Fetch section data automatically for page_content
  React.useEffect(() => {
    if (uploadType === 'page_content' && sectionId && mode === 'upload') {
      const fetchSection = async () => {
        try {
          const { getDoc, doc: firestoreDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(firestoreDoc(db, "page_content", sectionId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || "");
            setDescription(data.description || "");
            setPreview(data.imageUrl || "");
            setCurrentGallery(data.imageUrls || []);
            setEditingId(sectionId);
          } else {
            setTitle("");
            setDescription("");
            setPreview("");
            setCurrentGallery([]);
            setEditingId(sectionId);
          }
        } catch (err) {
          console.error("Error fetching section:", err);
        }
      };
      fetchSection();
    }
  }, [uploadType, sectionId, mode]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setMode('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (uploadType === 'products') {
      setProductName(item.name || "");
      setPreview(item.imageUrl || "");
    } else if (uploadType === 'gallery') {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setCategory(item.category || "");
      setPreview(item.url || "");
    } else if (uploadType === 'page_content') {
      setSectionId(item.id);
      setTitle(item.title || "");
      setDescription(item.description || "");
      setPreview(item.imageUrl || "");
    } else if (uploadType === 'services') {
      setTitle(item.title || "");
      setDescription(item.desc || "");
      setDetails(item.details || "");
      setIcon(item.icon || "Beaker");
      setPreview(item.bg || "");
    } else if (uploadType === 'testimonials') {
      setTitle(item.name || "");
      setCompany(item.company || "");
      setDescription(item.text || "");
    } else if (uploadType === 'barite_properties') {
      setLabel(item.label || "");
      setValue(item.value || "");
    } else if (uploadType === 'barite_applications') {
      setTitle(item.title || "");
      setDescription(item.desc || "");
    }
    
    if (item.imageUrls) {
      setCurrentGallery(item.imageUrls);
    } else {
      setCurrentGallery([]);
    }
  };

  const handleRemoveFromGallery = async (imageUrl: string) => {
    if (!editingId) return;

    try {
      const { arrayRemove } = await import('firebase/firestore');
      const docRef = doc(db, uploadType, editingId);
      
      await updateDoc(docRef, {
        imageUrls: arrayRemove(imageUrl)
      });

      // Also delete from storage if it's a firebase storage URL
      if (imageUrl.includes('firebasestorage')) {
        try {
          const storageRef = ref(storage, imageUrl);
          await deleteObject(storageRef);
        } catch (e) {
          console.warn("Storage deletion failed:", e);
        }
      }

      setCurrentGallery(prev => prev.filter(url => url !== imageUrl));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Remove from gallery error:", err);
      handleFirestoreError(err, OperationType.UPDATE, `${uploadType}/${editingId}`);
    }
  };

  const handleDelete = async (item: any) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, uploadType, item.id));
      
      // Attempt to delete from Storage if URL exists
      const imageUrls = item.imageUrls || [item.url || item.imageUrl || item.bg];
      
      for (const url of imageUrls) {
        if (url && typeof url === 'string' && url.includes('firebasestorage')) {
          try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
          } catch (storageErr) {
            console.warn("Could not delete storage object:", storageErr);
          }
        }
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
      handleFirestoreError(err, OperationType.DELETE, `${uploadType}/${item.id}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t("Are you sure you want to delete ALL items in this category? This cannot be undone."))) return;
    
    setClearingAll(true);
    setError("");
    try {
      // We use the items already fetched in the state
      const deletePromises = items.map(item => handleDelete(item));
      await Promise.all(deletePromises);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchItems();
    } catch (err) {
      console.error("Clear all error:", err);
      handleFirestoreError(err, OperationType.DELETE, uploadType);
    } finally {
      setClearingAll(false);
    }
  };

  const handleUpload = async () => {
    if (!editingId && !imageFile && !['testimonials', 'barite_properties', 'barite_applications'].includes(uploadType)) {
      setError(t("Please select an image"));
      return;
    }

    if ((uploadType === 'products' && !productName) || 
        (uploadType === 'page_content' && !sectionId) ||
        (uploadType === 'gallery' && !title) ||
        (uploadType === 'services' && !title) ||
        (uploadType === 'testimonials' && !title) ||
        (uploadType === 'barite_properties' && !label) ||
        (uploadType === 'barite_applications' && !title)) {
      setError(t("Please fill in all required fields"));
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      let downloadURL = preview;

      if (imageFile) {
        let folder = 'products';
        if (uploadType === 'page_content') folder = 'page_content';
        if (uploadType === 'gallery') folder = 'gallery';
        if (uploadType === 'services') folder = 'services';

        const storageRef = ref(
          storage,
          `${folder}/${Date.now()}_${imageFile.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(percent);
            },
            reject,
            async () => {
              downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      if (editingId) {
        const docRef = doc(db, uploadType, editingId);
        if (uploadType === 'products') {
          await updateDoc(docRef, {
            name: productName,
            imageUrl: downloadURL,
            updatedAt: serverTimestamp(),
          });
        } else if (uploadType === 'gallery') {
          await updateDoc(docRef, {
            title: title,
            description: description || null,
            category: category || "General",
            url: downloadURL,
            updatedAt: serverTimestamp(),
          });
        } else if (uploadType === 'services') {
          await updateDoc(docRef, {
            title: title,
            desc: description,
            details: details,
            icon: icon,
            bg: downloadURL,
            updatedAt: serverTimestamp(),
          });
        } else if (uploadType === 'testimonials') {
          await updateDoc(docRef, {
            name: title,
            company: company,
            text: description,
            updatedAt: serverTimestamp(),
          });
        } else if (uploadType === 'barite_properties') {
          await updateDoc(docRef, {
            label: label,
            value: value,
            updatedAt: serverTimestamp(),
          });
        } else if (uploadType === 'barite_applications') {
          await updateDoc(docRef, {
            title: title,
            desc: description,
            updatedAt: serverTimestamp(),
          });
        } else {
          const { arrayUnion } = await import('firebase/firestore');
          const updateData: any = {
            title: title || null,
            description: description || null,
            updatedAt: serverTimestamp(),
          };
          
          if (imageFile) {
            updateData.imageUrl = downloadURL;
            updateData.imageUrls = arrayUnion(downloadURL);
          } else if (!preview) {
            // If preview was cleared, remove the main imageUrl
            updateData.imageUrl = null;
          }
          
          await updateDoc(docRef, { ...updateData });
        }
      } else {
        if (uploadType === 'products') {
          await addDoc(collection(db, "products"), {
            name: productName,
            imageUrl: downloadURL,
            createdAt: serverTimestamp(),
          });
        } else if (uploadType === 'gallery') {
          await addDoc(collection(db, "gallery"), {
            title: title,
            description: description || null,
            category: category || "General",
            url: downloadURL,
            createdAt: serverTimestamp(),
          });
        } else if (uploadType === 'services') {
          await addDoc(collection(db, "services"), {
            title: title,
            desc: description,
            details: details,
            icon: icon,
            bg: downloadURL,
            createdAt: serverTimestamp(),
          });
        } else if (uploadType === 'testimonials') {
          await addDoc(collection(db, "testimonials"), {
            name: title,
            company: company,
            text: description,
            createdAt: serverTimestamp(),
          });
        } else if (uploadType === 'barite_properties') {
          await addDoc(collection(db, "barite_properties"), {
            label: label,
            value: value,
            createdAt: serverTimestamp(),
          });
        } else if (uploadType === 'barite_applications') {
          await addDoc(collection(db, "barite_applications"), {
            title: title,
            desc: description,
            createdAt: serverTimestamp(),
          });
        } else {
          const { setDoc, arrayUnion } = await import('firebase/firestore');
          await setDoc(doc(db, "page_content", sectionId), {
            imageUrl: downloadURL,
            imageUrls: arrayUnion(downloadURL),
            title: title || null,
            description: description || null,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }

      setSuccess(true);
      
      // Reset logic
      if (uploadType !== 'page_content') {
        setProductName("");
        setTitle("");
        setDescription("");
        setCategory("");
        setIcon("Beaker");
        setDetails("");
        setCompany("");
        setLabel("");
        setValue("");
        setCurrentGallery([]);
        setPreview("");
        setEditingId(null);
      } else {
        // For page_content, keep the context but add the new image to gallery
        if (imageFile && downloadURL) {
          setCurrentGallery(prev => {
            if (prev.includes(downloadURL)) return prev;
            return [...prev, downloadURL];
          });
          setPreview(downloadURL);
        }
      }

      setImageFile(null);
      setProgress(0);
      setUploading(false);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, uploadType);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-8 lg:p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('Admin Portal')}</h2>
                <p className="text-gray-500 text-sm font-medium">{t('Manage products, gallery and content')}</p>
              </div>
            </div>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              onClick={() => {
                setMode('upload');
                setEditingId(null);
                setProductName("");
                setTitle("");
                setDescription("");
                setCategory("");
                setPreview("");
                setImageFile(null);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                mode === 'upload' ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={18} />
              <span>{editingId ? t('Edit Item') : t('Upload New')}</span>
            </button>
            <button
              onClick={() => setMode('manage')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                mode === 'manage' ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={18} />
              <span>{t('Manage Existing')}</span>
            </button>
          </div>

          <div className="flex p-1 bg-gray-50 rounded-2xl mb-8 border border-gray-100 overflow-x-auto">
            <button
              onClick={() => setUploadType('products')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'products' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Products')}
            </button>
            <button
              onClick={() => setUploadType('gallery')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'gallery' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Gallery')}
            </button>
            <button
              onClick={() => setUploadType('page_content')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'page_content' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Page Content')}
            </button>
            <button
              onClick={() => setUploadType('services')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'services' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Services')}
            </button>
            <button
              onClick={() => setUploadType('testimonials')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'testimonials' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Testimonials')}
            </button>
            <button
              onClick={() => setUploadType('barite_properties')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'barite_properties' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Barite Props')}
            </button>
            <button
              onClick={() => setUploadType('barite_applications')}
              className={`flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                uploadType === 'barite_applications' ? 'bg-white text-teal-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('Barite Apps')}
            </button>
          </div>

          {mode === 'upload' ? (
            <div className="space-y-6">
              {uploadType === 'products' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('Product Name')}</label>
                  <input
                    type="text"
                    placeholder={t("Enter product name")}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                  />
                </div>
              )}

              {uploadType === 'gallery' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Image Title')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter image title")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Description (Optional)')}</label>
                    <textarea
                      placeholder={t("Enter image description")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Category (Optional)')}</label>
                    <input
                      type="text"
                      placeholder={t("e.g. Facilities, Products, Operations")}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {uploadType === 'services' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Service Title')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter service title")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Short Description')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter short description")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Full Details')}</label>
                    <textarea
                      placeholder={t("Enter full service details")}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Icon (Lucide Name)')}</label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white"
                    >
                      <option value="Beaker">Beaker</option>
                      <option value="FlaskConical">FlaskConical</option>
                      <option value="Droplets">Droplets</option>
                      <option value="ShieldCheck">ShieldCheck</option>
                      <option value="Globe">Globe</option>
                      <option value="Zap">Zap</option>
                      <option value="Activity">Activity</option>
                      <option value="Microscope">Microscope</option>
                    </select>
                  </div>
                </div>
              )}

              {uploadType === 'testimonials' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Client Name')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter client name")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Company')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter company name")}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Testimonial Text')}</label>
                    <textarea
                      placeholder={t("Enter testimonial")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {uploadType === 'barite_properties' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Property Label')}</label>
                    <input
                      type="text"
                      placeholder={t("e.g. Specific Gravity")}
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Property Value')}</label>
                    <input
                      type="text"
                      placeholder={t("e.g. 4.2 - 4.5")}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {uploadType === 'barite_applications' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Application Title')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter application title")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Description')}</label>
                    <textarea
                      placeholder={t("Enter application description")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {uploadType === 'page_content' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Section ID')}</label>
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      disabled={!!editingId}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white disabled:bg-gray-50"
                    >
                      <option value="barite-hero">{t('Barite Hero')}</option>
                      <option value="home-hero">{t('Home Hero')}</option>
                      <option value="home-about">{t('Home About Us')}</option>
                      <option value="chemicals-hero">{t('Chemicals Hero')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Display Title (Optional)')}</label>
                    <input
                      type="text"
                      placeholder={t("Enter title")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">{t('Description (Optional)')}</label>
                    <textarea
                      placeholder={t("Enter description")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all min-h-[100px]"
                    />
                  </div>

                  {editingId && currentGallery.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">{t('Current Gallery Images')}</label>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirmClearGallery) {
                              setConfirmClearGallery(true);
                              setTimeout(() => setConfirmClearGallery(false), 3000);
                              return;
                            }
                            
                            try {
                              const docRef = doc(db, uploadType, editingId);
                              await updateDoc(docRef, { imageUrls: [] });
                              setCurrentGallery([]);
                              setConfirmClearGallery(false);
                              setSuccess(true);
                              setTimeout(() => setSuccess(false), 3000);
                            } catch (err) {
                              setError(t("Failed to clear gallery."));
                            }
                          }}
                          className={`text-xs font-bold transition-colors ${confirmClearGallery ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                        >
                          {confirmClearGallery ? t('Click again to clear all') : t('Clear All')}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {currentGallery.map((url, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200">
                            <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                if (confirmGalleryDeleteUrl === url) {
                                  handleRemoveFromGallery(url);
                                  setConfirmGalleryDeleteUrl(null);
                                } else {
                                  setConfirmGalleryDeleteUrl(url);
                                  setTimeout(() => setConfirmGalleryDeleteUrl(null), 3000);
                                }
                              }}
                              className={`absolute top-1 right-1 p-1 rounded-full transition-all shadow-md ${
                                confirmGalleryDeleteUrl === url ? 'bg-red-600 text-white opacity-100' : 'bg-red-500 text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title={confirmGalleryDeleteUrl === url ? t('Confirm') : t('Remove')}
                            >
                              {confirmGalleryDeleteUrl === url ? <CheckCircle size={14} /> : <X size={14} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Drag & Drop Area */}
              {!['testimonials', 'barite_properties', 'barite_applications'].includes(uploadType) && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t('Upload Image')}</label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                      ${preview ? 'border-teal-500 bg-teal-50/30' : 'border-gray-200 hover:border-teal-400 hover:bg-gray-50'}`}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    
                    <AnimatePresence mode="wait">
                      {preview ? (
                        <motion.div 
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative inline-block w-full"
                        >
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-48 w-full object-cover rounded-xl shadow-md"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreview("");
                              setImageFile(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold">{t('Click to upload or drag and drop')}</p>
                            <p className="text-gray-500 text-sm">{t('PNG, JPG or WEBP (max. 5MB)')}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <AnimatePresence>
                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-teal-600">{t('Uploading...')}</span>
                      <span className="text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-teal-600 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-teal-50 text-teal-700 p-4 rounded-xl flex items-center space-x-2 text-sm font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>
                      {editingId ? t('Item updated successfully!') :
                       uploadType === 'products' ? t('Product uploaded successfully!') : 
                       uploadType === 'gallery' ? t('Gallery image uploaded successfully!') :
                       t('Page content updated successfully!')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || (!editingId && !imageFile && !['testimonials', 'barite_properties', 'barite_applications'].includes(uploadType)) || (uploadType === 'products' ? !productName : uploadType === 'gallery' ? !title : uploadType === 'services' ? !title : uploadType === 'testimonials' ? !title : uploadType === 'barite_properties' ? !label : uploadType === 'barite_applications' ? !title : !sectionId)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 shadow-lg
                  ${uploading || (!editingId && !imageFile && !['testimonials', 'barite_properties', 'barite_applications'].includes(uploadType)) || (uploadType === 'products' ? !productName : uploadType === 'gallery' ? !title : uploadType === 'services' ? !title : uploadType === 'testimonials' ? !title : uploadType === 'barite_properties' ? !label : uploadType === 'barite_applications' ? !title : !sectionId) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-teal-900 text-white hover:bg-teal-800 shadow-teal-900/20'}`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{t('Processing...')}</span>
                  </>
                ) : (
                  <>
                    {editingId ? <Edit2 size={20} /> : <Upload size={20} />}
                    <span>
                      {editingId ? t('Update Item') :
                       uploadType === 'products' ? t('Upload Product') : 
                       uploadType === 'gallery' ? t('Upload to Gallery') :
                       t('Update Page Content')}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingItems ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-teal-600 mb-4" size={32} />
                  <p className="text-gray-500 font-medium">{t('Loading items...')}</p>
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-bold text-gray-500">{items.length} {t('Items Found')}</span>
                    <button
                      onClick={handleClearAll}
                      disabled={clearingAll}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      {clearingAll ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
                      <span>{t('Clear All')}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-200 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        {(item.url || item.imageUrl || item.bg) ? (
                          <img 
                            src={item.url || item.imageUrl || item.bg} 
                            alt={item.title || item.name} 
                            className="w-16 h-16 object-cover rounded-xl shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">{t(item.title || item.name || item.label || item.id)}</h4>
                          <p className="text-xs text-gray-500 font-medium">{t(item.category || item.company || item.value || (uploadType === 'page_content' ? 'Section' : 'General'))}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title={t('Edit')}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirmDeleteId === item.id) {
                              handleDelete(item);
                              setConfirmDeleteId(null);
                            } else {
                              setConfirmDeleteId(item.id);
                              setTimeout(() => setConfirmDeleteId(null), 3000);
                            }
                          }}
                          className={`p-2 rounded-lg transition-all ${confirmDeleteId === item.id ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50'}`}
                          title={confirmDeleteId === item.id ? t('Click again to confirm') : t('Delete')}
                        >
                          {confirmDeleteId === item.id ? <X size={18} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <ImageIcon className="mx-auto text-gray-300 mb-4" size={40} />
                  <p className="text-gray-500 font-medium">{t('No items found in this category.')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
