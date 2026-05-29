/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  Database,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  ChevronRight,
  Globe,
  User,
  LogOut,
  Sliders,
  Filter,
  Loader2,
  Info,
  Award,
  Headphones,
  Mic,
  Volume2,
  Lock,
  Mail
} from 'lucide-react';
import Scheduler from './components/Scheduler';
import { Article, WordPressConfig, WordPressSite, GenerateRequest, ScheduledTask } from './types';
import SeoGrowthChart from './components/SeoGrowthChart';

export default function App() {
  // WordPress Connection States
  const [wpConfig, setWpConfig] = useState<WordPressConfig>({
    siteUrl: '',
    username: '',
    isConnected: false,
  });

  const [wpSites, setWpSites] = useState<WordPressSite[]>([]);
  const [selectedSiteIdsForPublish, setSelectedSiteIdsForPublish] = useState<string[]>([]);
  
  // Automated schedule suggestion states
  const [isAnalyzingSchedule, setIsAnalyzingSchedule] = useState(false);
  const [scheduleSuggestion, setScheduleSuggestion] = useState<{
    suggestedDateTime: string;
    suggestedHour: string;
    explanation: string;
    analytics: {
      id: string;
      title: string;
      category: string;
      totalViews: number;
      peakHour: string;
      peakDay: string;
      engagementRate: string;
    }[];
  } | null>(null);
  
  const [inputSiteName, setInputSiteName] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  const [dbStatus, setDbStatus] = useState<{ isMongoDB: boolean; isConnected: boolean; type: string; error: string | null }>({
    isMongoDB: false,
    isConnected: false,
    type: 'Local JSON File',
    error: null
  });

  // Articles States
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  // active selected tab: "dashboard", "generate", or "profile"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'profile' | 'scheduler'>('dashboard');

  // User Authentication & Profile States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') !== 'false';
  });

  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);

  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem('profile_name') || 'شاكر محمد',
    email: localStorage.getItem('profile_email') || 'chakerm811@gmail.com',
    bio: localStorage.getItem('profile_bio') || 'خبير وبناء استراتيجيات سيو وصناعة محتوى رقمي بالذكاء الاصطناعي، مهتم بنشر المعرفة وتطوير الويب لخدمة القراء العرب بشكل متقدم ودقيق.',
    role: localStorage.getItem('profile_role') || 'مدير المحتوى الرئيسي',
    avatarUrl: localStorage.getItem('profile_avatarUrl') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    joinedAt: '2026-01-15',
  });

  const handleUpdateProfile = (updated: typeof userProfile) => {
    setUserProfile(updated);
    localStorage.setItem('profile_name', updated.name);
    localStorage.setItem('profile_email', updated.email);
    localStorage.setItem('profile_bio', updated.bio);
    localStorage.setItem('profile_role', updated.role);
    localStorage.setItem('profile_avatarUrl', updated.avatarUrl);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    setActiveTab('dashboard'); // reset tab on logout
  };

  const handleLogin = (email: string, name?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    if (email) {
      const updated = { ...userProfile, email, name: name || userProfile.name };
      handleUpdateProfile(updated);
    }
  };

  // Article Generation States
  const [genTopic, setGenTopic] = useState('');
  const [genCategory, setGenCategory] = useState('');
  const [genKeywords, setGenKeywords] = useState('');
  const [genLanguage, setGenLanguage] = useState<'ar' | 'en'>('ar');
  const [genTone, setGenTone] = useState('professional');
  const [genLength, setGenLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [genSubheadings, setGenSubheadings] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [genError, setGenError] = useState('');

  // Selected Article view or edit drawer
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editMetaDescription, setEditMetaDescription] = useState('');
  const [editSections, setEditSections] = useState<{ heading: string; content: string }[]>([]);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [canBypassPublish, setCanBypassPublish] = useState(false);

  // WordPress Import Articles State
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Featured Image Generation State
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Podcast Audio Generation States
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastMessage, setPodcastMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Real-time scheduler status monitor state
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  // Initial Fetch dashboard statistics & settings
  const fetchDashboard = async () => {
    try {
      const [res, tasksRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/tasks/list')
      ]);
      if (res.ok) {
        const data = await res.json();
        setWpConfig(data.wordpressConfig);
        setWpSites(data.wordpressSites || []);
        setArticles(data.articles);
        if (data.dbStatus) {
          setDbStatus(data.dbStatus);
        }
        
        // Populate WP input states with existing details if any
        if (data.wordpressConfig.siteUrl) {
          setInputUrl(data.wordpressConfig.siteUrl);
          setInputUsername(data.wordpressConfig.username);
        }
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setScheduledTasks(tasksData.tasks);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingArticles(false);
      setLastCheckTime(new Date().toLocaleTimeString('ar-EG'));
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Keep checking stats periodically to simulate scheduler refresh
    const interval = setInterval(() => {
      fetchDashboard();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Podcast Conversion
  const handleGeneratePodcast = async (articleId: string) => {
    setIsGeneratingPodcast(true);
    setPodcastMessage({ text: '', type: '' });

    try {
      const res = await fetch(`/api/articles/${articleId}/generate-podcast`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPodcastMessage({ text: data.message, type: 'success' });
        
        // Update articles list and selectedArticle state so audio fields bind immediately
        setArticles(prev => prev.map(a => {
          if (a.id === articleId) {
            return { ...a, audioUrl: data.audioUrl, podcastScript: data.podcastScript };
          }
          return a;
        }));

        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(prev => {
            if (!prev) return null;
            return { ...prev, audioUrl: data.audioUrl, podcastScript: data.podcastScript };
          });
        }
      } else {
        setPodcastMessage({ text: data.error || 'فشل توليد الملف الصوتي.', type: 'error' });
      }
    } catch (err: any) {
      setPodcastMessage({ text: `خطأ اتصال غير مرتقب: ${err.message}`, type: 'error' });
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const handleGenerateImage = async (articleId: string) => {
    setIsGeneratingImage(true);
    setImageMessage({ text: '', type: '' });
    try {
      const res = await fetch(`/api/articles/${articleId}/generate-image`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setImageMessage({ text: 'تم إنشاء الصورة بنجاح!', type: 'success' });
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, featuredImageUrl: data.featuredImageUrl } : a));
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(prev => prev ? { ...prev, featuredImageUrl: data.featuredImageUrl } : null);
        }
      } else {
        setImageMessage({ text: data.error || 'فشل إنشاء الصورة.', type: 'error' });
      }
    } catch (err: any) {
      setImageMessage({ text: `خطأ: ${err.message}`, type: 'error' });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleScheduleTask = async (titles: string[], scheduledAt: string, category: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/tasks/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles, scheduledAt, category }),
      });
      const data = await res.json();
      if (res.ok) {
        setScheduledTasks(prev => [...prev, data.task]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScheduledTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Podcast Deletion
  const handleDeletePodcast = async (articleId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف المرفق الصوتي؟')) return;
    
    try {
      const res = await fetch(`/api/articles/${articleId}/audio`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPodcastMessage({ text: 'تم حذف البودكاست بنجاح.', type: 'success' });
        
        // Update states
        setArticles(prev => prev.map(a => {
          if (a.id === articleId) {
            return { ...a, audioUrl: null, podcastScript: null };
          }
          return a;
        }));

        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(prev => {
            if (!prev) return null;
            return { ...prev, audioUrl: null, podcastScript: null };
          });
        }
      } else {
        alert(data.error || 'فشل حذف المرفق الصوتي.');
      }
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    }
  };

  // Connect WordPress logic supporting multiple sites
  const handleConnectWP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/wordpress/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: inputUrl,
          username: inputUsername,
          applicationPassword: inputPassword,
          name: inputSiteName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConnectMessage({
          text: data.message || 'تم ربط مدونة ووردبريس بنجاح وحفظها بالملف الشخصي!',
          type: 'success',
        });
        setInputPassword(''); // clear sensitive password
        setInputSiteName('');
      } else {
        setConnectMessage({
          text: data.error || data.message || 'فشل الاتصال بمدونة ووردبريس. يرجى مراجعة عنوان الموقع وصلاحية بيانات الاعتماد.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setConnectMessage({
        text: `خطأ أثناء الاتصال: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsConnecting(false);
      fetchDashboard();
    }
  };

  // Disconnect a specific WordPress site
  const handleDisconnectWPSite = async (siteId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في قطع اتصال هذه المدونة؟')) return;
    try {
      const res = await fetch(`/api/wordpress/sites/${siteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectMessage({ text: 'تم قطع اتصال المدونة بنجاح.', type: 'success' });
        fetchDashboard();
      } else {
        alert(data.error || 'فشل قطع اتصال المدونة.');
      }
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    }
  };

  // Disconnect WordPress (all sites)
  const handleDisconnectWP = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في قطع الاتصال بجميع المدونات؟')) return;
    try {
      const res = await fetch('/api/wordpress/disconnect', { method: 'POST' });
      if (res.ok) {
        setWpConfig({ siteUrl: '', username: '', isConnected: false });
        setWpSites([]);
        setInputUrl('');
        setInputUsername('');
        setInputPassword('');
        setInputSiteName('');
        setConnectMessage({ text: 'تم قطع الاتصال بكافة المدونات بنجاح.', type: 'success' });
      }
    } catch (err: any) {
      console.error('Disconnect error:', err);
    } finally {
      fetchDashboard();
    }
  };

  // Import existing articles from WordPress blog
  const handleImportArticles = async () => {
    setIsImporting(true);
    setImportMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/wordpress/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setImportMessage({
          text: data.message || `تم بنجاح استيراد ومزامنة المقالات من ووردبريس.`,
          type: 'success'
        });
        // Reload dashboard articles list
        fetchDashboard();
      } else {
        setImportMessage({
          text: data.error || 'فشل استيراد المقالات من المدونة. يرجى مراجعة إعدادات ربط ووردبريس.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setImportMessage({
        text: `فشل الاتصال بالخادم الرئيسي: ${err.message}`,
        type: 'error'
      });
    } finally {
      setIsImporting(false);
      // Auto-clear notification after 8 seconds
      setTimeout(() => {
        setImportMessage(prev => prev.text ? { text: '', type: '' } : prev);
      }, 8000);
    }
  };

  // Generate article using AI (Gemini 3.5)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      alert('يرجى إدخال عنوان أو موضوع المقال.');
      return;
    }

    setIsGenerating(true);
    setGenError('');
    setGenerationStep(1);

    // Dynamic steps animation timer
    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2800);

    try {
      const kwArray = genKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic,
          category: genCategory,
          keywords: kwArray,
          language: genLanguage,
          tone: genTone,
          targetLength: genLength,
          subheadingsCount: genSubheadings,
        } as GenerateRequest),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'عذراً، حدث خطأ غير متوقع أثناء توليد المقال بالذكاء الاصطناعي.');
      }

      const newArticle = await res.json() as Article;
      setArticles((prev) => [newArticle, ...prev]);
      
      // Stop timer and show generated article in detail drawer instantly
      clearInterval(stepTimer);
      setIsGenerating(false);
      setGenTopic('');
      setGenCategory('');
      setGenKeywords('');
      
      // Open the new article detail
      handleViewArticle(newArticle);
      setActiveTab('dashboard');
      
      // Auto-generate featured image
      await handleGenerateImage(newArticle.id);
    } catch (err: any) {
      clearInterval(stepTimer);
      setIsGenerating(false);
      setGenError(err.message || 'خطأ غير معروف أثناء الاتصال بخادم الذكاء الاصطناعي.');
    }
  };

  // Open Article Detail Drawer
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditTitle(article.title);
    setEditCategory(article.category || 'عام');
    setEditExcerpt(article.excerpt);
    setEditMetaDescription(article.metaDescription);
    setEditSections(JSON.parse(JSON.stringify(article.sections))); // Deep clone
    setEditKeywords(article.keywords || []);
    setScheduleDate(article.scheduledAt ? article.scheduledAt.substring(0, 16) : '');
    setPublishMessage('');
    setIsEditing(false);
    setScheduleSuggestion(null);

    // Initialize multi-publishing targets selection
    if (article.status === 'scheduled' && Array.isArray(article.scheduledSiteIds) && article.scheduledSiteIds.length > 0) {
      setSelectedSiteIdsForPublish(article.scheduledSiteIds);
    } else {
      setSelectedSiteIdsForPublish((wpSites || []).map(s => s.id));
    }
  };

  // Save manual modifications back to server
  const handleSaveEdits = async () => {
    if (!selectedArticle) return;
    setIsSavingLocal(true);
    setPublishMessage('');

    // Precalculate new estimated word count
    let estimatedWords = 0;
    editSections.forEach((sec) => {
      const words = (sec.heading + ' ' + sec.content).trim().split(/\s+/).length;
      estimatedWords += words;
    });

    // Simple recalculation of clientside SEO checklist score
    const updatedScore = recalculateSeoScore(editTitle, editMetaDescription, editKeywords, editSections);

    const updatedData: Partial<Article> = {
      title: editTitle,
      category: editCategory,
      excerpt: editExcerpt,
      metaDescription: editMetaDescription,
      sections: editSections,
      seoScore: updatedScore,
      wordCount: estimatedWords,
    };

    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const resultJson = await res.json();
        setArticles(prev => prev.map((a) => (a.id === selectedArticle.id ? { ...a, ...updatedData } : a)));
        setSelectedArticle(prev => prev ? { ...prev, ...updatedData } : null);
        setIsEditing(false);
        setPublishMessage('تم حفظ التعديلات محلياً بنجاح.');
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'فشل حفظ التعديلات.');
      }
    } catch (error: any) {
      alert(`خطأ أثناء الحفظ الفعلي: ${error.message}`);
    } finally {
      setIsSavingLocal(false);
    }
  };

  // Fetch intelligent publication schedule suggestion
  const handleFetchScheduleSuggestion = async (articleId: string) => {
    setIsAnalyzingSchedule(true);
    setScheduleSuggestion(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/suggest-schedule`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setScheduleSuggestion({
            suggestedDateTime: data.suggestedDateTime,
            suggestedHour: data.suggestedHour,
            explanation: data.explanation,
            analytics: data.analytics || []
          });
          // Set the schedule date on target field
          setScheduleDate(data.suggestedDateTime);
        } else {
          alert(data.error || 'عذراً، لم نتمكن من تحليل أوقات النشر حالياً.');
        }
      } else {
        alert('فشل الاتصال بمخدم الاقتراحات الذكية.');
      }
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setIsAnalyzingSchedule(false);
    }
  };

  // Publish to WordPress Instantly OR Schedule
  const handlePublishOrSchedule = async (isInstant: boolean) => {
    if (!selectedArticle) return;
    setIsPublishingNow(true);
    setPublishMessage('');
    setCanBypassPublish(false);

    const schedulePayload = isInstant ? null : scheduleDate;

    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduleDate: schedulePayload, 
          selectedSiteIds: selectedSiteIdsForPublish 
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Sync article data in state
        setArticles(prev => prev.map((a) => (a.id === selectedArticle.id ? data.article : a)));
        setSelectedArticle(data.article);
        setPublishMessage(data.message);
        setCanBypassPublish(false);
      } else {
        setPublishMessage(`فشل النشر: ${data.error || 'خطأ في الاستجابة'}`);
        setCanBypassPublish(true);
      }
    } catch (err: any) {
      setPublishMessage(`تعذر إرسال الطلب للووردبريس: ${err.message}`);
      setCanBypassPublish(true);
    } finally {
      setIsPublishingNow(false);
      fetchDashboard();
    }
  };

  // Perform Local Bypass Publish
  const handleLocalBypassPublish = async () => {
    if (!selectedArticle) return;
    setIsPublishingNow(true);
    setPublishMessage('');
    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduleDate: null, 
          selectedSiteIds: selectedSiteIdsForPublish,
          forceLocalDbOnly: true
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setArticles(prev => prev.map((a) => (a.id === selectedArticle.id ? data.article : a)));
        setSelectedArticle(data.article);
        setPublishMessage(data.message);
        setCanBypassPublish(false);
      } else {
        setPublishMessage(`فشل النشر المحلي في قاعدة البيانات: ${data.error || 'غير معروف'}`);
      }
    } catch (err: any) {
      setPublishMessage(`تعذر إرسال طلب النشر المحلي: ${err.message}`);
    } finally {
      setIsPublishingNow(false);
      fetchDashboard();
    }
  };

  // Delete an article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('هل أنت متأكد تماماً من رغبتك في حذف هذا المقال من السجلات؟')) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (selectedArticle?.id === id) {
          setSelectedArticle(null);
        }
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'فشل حذف المقال.');
      }
    } catch (err: any) {
      alert(`عذراً، حدث خطأ أثناء الحذف: ${err.message}`);
    }
  };

  // Standard interactive SEO quality formula (recalculating rating out of 100)
  const recalculateSeoScore = (
    title: string,
    meta: string,
    kws: string[],
    sections: { heading: string; content: string }[]
  ): number => {
    let score = 50; // base score if title exists

    if (!title) return 0;
    
    // Keyword in title
    const titleLower = title.toLowerCase();
    const hasKwInTitle = kws.some(kw => titleLower.includes(kw.toLowerCase()));
    if (hasKwInTitle && kws.length > 0) score += 15;

    // Meta Description Length
    const metaLength = meta?.length || 0;
    if (metaLength >= 110 && metaLength <= 165) {
      score += 15;
    } else if (metaLength > 40) {
      score += 5;
    }

    // Paragraph Count / Structure depth
    if (sections.length >= 4) {
      score += 10;
    } else if (sections.length >= 2) {
      score += 5;
    }

    // Total content volume
    let totalText = sections.map(s => s.heading + " " + s.content).join(" ");
    const wordCount = totalText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 1000) {
      score += 10;
    } else if (wordCount > 500) {
      score += 7;
    } else if (wordCount > 200) {
      score += 3;
    }

    return Math.min(score, 100);
  };

  // Local SEO checklist verification points
  const getSubChecklist = (
    title: string,
    meta: string,
    kws: string[],
    sections: { heading: string; content: string }[]
  ) => {
    const totalText = sections.map(s => s.heading + " " + s.content).join(" ");
    const wordCount = totalText.split(/\s+/).filter(Boolean).length;
    
    return [
      {
        id: '1',
        titleAr: 'تضمين الكلمة المفتاحية في العنوان الرئيسي للمقال',
        passed: kws.some(kw => title.toLowerCase().includes(kw.toLowerCase())) || kws.length === 0,
        impact: 'عالي التأثير'
      },
      {
        id: '2',
        titleAr: 'طول وصف سيو الميتا معتدل ومثالي (110 - 165 حرفًا)',
        passed: meta.length >= 110 && meta.length <= 165,
        impact: 'متوسط التأثير'
      },
      {
        id: '3',
        titleAr: 'شمولية النص الحصري وغنى الكلمات (أكثر من 500 كلمة)',
        passed: wordCount >= 500,
        impact: 'عالي التأثير'
      },
      {
        id: '4',
        titleAr: 'هيكلة مثالية للعناوين الفرعية المتعددة (H2/H3)',
        passed: sections.length >= 3,
        impact: 'منخفض التأثير'
      }
    ];
  };

  // Filtered Articles based on search & filter pins
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (art.category && art.category.trim().toLowerCase() === categoryFilter.trim().toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Aggregated analytical statistics
  const uniqueCategories = Array.from(
    new Set(articles.map((a) => (a.category || 'عام').trim()))
  ).filter(Boolean) as string[];

  const totalCreatedCount = articles.length;
  const avgSeoScore = articles.length > 0 ? Math.round(articles.reduce((sum, item) => sum + item.seoScore, 0) / articles.length) : 92;
  const totalScheduled = articles.filter(a => a.status === 'scheduled').length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 antialiased font-sans" dir="rtl">
        {/* Core Card with premium glassmorphism effect */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          
          <div className="p-6 sm:p-8 bg-blue-600 text-white text-center relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-blue-500 rounded-full opacity-30"></div>
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-blue-700 rounded-full opacity-30"></div>
            
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner backdrop-blur-md">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">مرحباً بك في أوتو رايت</h1>
            <p className="text-xs text-blue-100 mt-1">بوابتك الذكية لتوليد المحتوى والسيو وربط الووردبريس</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-lg text-xs leading-relaxed text-blue-800 text-right">
              <span className="font-bold block mb-1 text-right">💡 وصول مجاني تمثيلي مباشر:</span>
              انقر على زر الدخول أدناه لاستعراض كامل الخيارات وحفظ التغييرات محلياً فورياً وتوليد البودكاست. يمكنك تخصيص بيانات بروفايلك بالكامل في صفحة الملف الشخصي.
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              const name = formData.get('name') as string;
              handleLogin(email, name);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-right">الاسم بالكامل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={userProfile.name}
                    placeholder="ضع اسمك هنا"
                    className="block w-full pr-10 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={userProfile.email}
                    placeholder="name@example.com"
                    className="block w-full pr-10 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-left focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-right">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    defaultValue="demo123456"
                    placeholder="••••••••"
                    className="block w-full pr-10 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-left focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                <CheckCircle className="w-4 h-4 text-green-300" />
                تسجيل الدخول والوصول الفوري
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 text-center text-xs text-gray-400">
            أوتو رايت • منصة السيو والذكاء الاصطناعي المثالية © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col antialiased text-gray-900" dir="rtl">
      {/* Dynamic Overlay Navigation bar matching Professional Polish theme */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-sm z-30">
        <div className="flex items-center space-x-reverse space-x-6">
          <div className="flex items-center space-x-reverse space-x-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight block">أوتو رايت</span>
              <span className="text-[10px] text-gray-400 block -mt-1 font-mono">AutoWrite SEO</span>
            </div>
          </div>

          <div className="h-6 w-[1.5px] bg-gray-200 hidden sm:block"></div>

          {/* Quick tab switch buttons */}
          <div className="flex space-x-reverse space-x-3 text-sm">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedArticle(null); }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              لوحة التحكم
            </button>
            <button
              onClick={() => { setActiveTab('generate'); setSelectedArticle(null); }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeTab === 'generate'
                  ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              توليد مقال جديد
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedArticle(null); }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 text-slate-505" />
              الملف الشخصي
            </button>
            <button
              onClick={() => { setActiveTab('scheduler'); setSelectedArticle(null); }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'scheduler'
                  ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-505" />
              الجدولة
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-reverse space-x-4">
          {/* Database Connection Badge */}
          <div className="hidden sm:flex">
            {dbStatus.isMongoDB ? (
              dbStatus.isConnected ? (
                <div 
                  title="قاعدة بيانات MongoDB السحابية متصلة وتعمل بنجاح!"
                  className="flex items-center bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 hover:bg-emerald-100/50 transition-colors cursor-help"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600 ml-1.5" />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1.5 animate-pulse"></div>
                  <span className="text-[11px] text-emerald-700 font-semibold">MongoDB متصلة</span>
                </div>
              ) : (
                <div 
                  title={`فشل الاتصال بـ MongoDB: ${dbStatus.error || 'خطأ غير معروف'}`}
                  className="flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-150 hover:bg-red-100/50 transition-colors cursor-help"
                >
                  <Database className="w-3.5 h-3.5 text-red-500 ml-1.5" />
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full ml-1.5"></div>
                  <span className="text-[11px] text-red-700 font-semibold" dir="rtl">عطل بالاتصال</span>
                </div>
              )
            ) : (
              <div 
                title="نظام النسخ الاحتياطي المحلي يعمل بشكل سليم. قم بتعيين MONGODB_URI لتفعيل MongoDB للإنتاج."
                className="flex items-center bg-slate-50 px-3 py-1 rounded-full border border-gray-150 hover:bg-slate-100 transition-colors cursor-help"
              >
                <Database className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                <span className="text-[11px] text-slate-700 font-semibold">JSON محلي</span>
              </div>
            )}
          </div>

          {/* WordPress Connection badge */}
          <div className="hidden md:flex">
            {wpConfig.isConnected ? (
              <div 
                title={`متصل بموقع: ${wpConfig.siteUrl}`}
                className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100 hover:bg-green-100/50 transition-colors cursor-help"
              >
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full ml-2 animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">الووردبريس متصل ({wpConfig.username})</span>
              </div>
            ) : (
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full ml-2"></div>
                <span className="text-xs text-yellow-700 font-medium">غير متصل بالووردبريس</span>
              </div>
            )}
          </div>

          <div 
            title="حسابك الشخصي - اضغط لتعديل الملف والخيارات"
            onClick={() => { setActiveTab('profile'); setSelectedArticle(null); }}
            className="w-10 h-10 bg-gray-150 rounded-full border-2 border-blue-50 flex items-center justify-center cursor-pointer shadow-sm hover:border-blue-500 hover:scale-105 transition-all overflow-hidden shrink-0"
          >
            {userProfile.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="font-bold text-gray-750 text-sm">
                {userProfile.name.charAt(0) || 'ش'}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Dashboard layout with slate content box */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* RIGHT/Main Section column containing stats and tables */}
        <div className="flex-1 flex flex-col space-y-6">
          
          {/* Dashboard Stats Panel cards strictly styled like Professional Polish */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">إجمالي المقالات المنتجة</p>
                <div className="p-1 px-2 rounded-md bg-slate-50 text-slate-500 text-[10px] font-mono">Total DB</div>
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{totalCreatedCount}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-green-600 font-medium">+15% من الأسبوع الجاري</span>
                <span className="text-gray-400 font-mono">حفظ تلقائي نَشِط</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">متوسط نقاط السيو SEO</p>
                <div className="p-1 px-2 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono">Rank Score</div>
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{avgSeoScore} <span className="text-sm font-medium text-gray-500">/ 100</span></p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-medium">أداء قوي جداً في المحركات</span>
                <span className="text-gray-400 font-mono">تحديث فوري</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">المنشورات المجدولة</p>
                <div className="p-1 px-2 rounded-md bg-amber-50 text-amber-600 text-[10px] font-mono">Scheduled</div>
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{totalScheduled}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-amber-600 font-medium">سيتم الجدولة والنشر آلياً</span>
                <span className="text-gray-400 text-[10px] font-mono">كل 20 ثانية</span>
              </div>
            </div>
          </div>

          {/* Core content switchboard view */}
          {activeTab === 'dashboard' ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[480px]">
              
              {/* Header inside the articles collection card */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-gray-50/50">
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">سجل المقالات والتحليلات</h2>
                  <p className="text-xs text-gray-500 mt-0.5">تعديل ونشر وجدولة المقالات المولدة بالذكاء الاصطناعي</p>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={handleImportArticles}
                    disabled={isImporting}
                    className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 px-3.5 py-2 rounded-lg text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 self-start"
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    ) : (
                      <Globe className="w-4 h-4 text-blue-600" />
                    )}
                    {isImporting ? 'جاري الاستيراد...' : 'استيراد المقالات الحالية'}
                  </button>

                  <button 
                    onClick={() => setActiveTab('generate')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" />
                    إنشاء مقال بالذكاء الاصطناعي
                  </button>
                </div>
              </div>

              {/* WordPress Import Success/Error Alert banner */}
              {importMessage.text && (
                <div className={`p-4 border-b text-xs font-semibold flex items-center justify-between text-right ${
                  importMessage.type === 'error' 
                    ? 'bg-rose-50 border-rose-100 text-rose-800' 
                    : 'bg-green-50 border-green-100 text-green-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${importMessage.type === 'error' ? 'text-rose-500' : 'text-green-500'}`} />
                    <span>{importMessage.text}</span>
                  </div>
                  <button 
                    onClick={() => setImportMessage({ text: '', type: '' })}
                    className="text-gray-400 hover:text-gray-600 transition-colors font-bold text-center w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200/50 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Filtering + Search controller row */}
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between gap-x-4">
                
                {/* Status pins filters */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-slate-950 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    الكل ({totalCreatedCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    المسودات ({articles.filter(a => a.status === 'draft').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('scheduled')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === 'scheduled'
                        ? 'bg-blue-55 text-blue-700 bg-blue-50 border border-blue-200/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    المجدولة ({articles.filter(a => a.status === 'scheduled').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('published')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === 'published'
                        ? 'bg-green-15 text-green-700 bg-green-50 border border-green-200/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    المنشورة ({articles.filter(a => a.status === 'published').length})
                  </button>
                </div>

                {/* Category Selection Filter dropdown */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-500 shrink-0">التصنيف:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-gray-250 text-xs text-gray-700 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="all">كل المواضيع ({articles.length})</option>
                    {uniqueCategories.map((cat, i) => {
                      const count = articles.filter(a => (a.category || 'عام').trim().toLowerCase() === cat.toLowerCase()).length;
                      return (
                        <option key={i} value={cat}>
                          {cat} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Instant text searching Box */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالعنوان أو الكلمات الدلالية..."
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all text-right"
                  />
                </div>
              </div>

              <SeoGrowthChart articles={articles} />

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto">
                {isLoadingArticles ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-500">جاري تحميل سجل المقالات والبيانات الحالية...</p>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-14 h-14 bg-slate-50 text-gray-400 border border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-1">لا توجد سجلات مطابقة</h3>
                    <p className="text-xs text-gray-400 max-w-sm mb-4">
                      {searchQuery ? 'لا توجد نتائج تطابق استعلام البحث المكتوب.' : 'لم تقم بتوليد أي مقال بعد. تفضل بزيارة المولد لبدء الكتابة الآلية!'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        أنتج مقالك الأول الآن ✨
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-[#F8FAFC] border-b border-gray-100 text-gray-500 text-xs tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5 font-bold text-gray-600">العنوان والموضوع الرئيسي</th>
                        <th className="px-5 py-3.5 font-bold text-gray-600 hidden md:table-cell">الكلمات المستهدفة</th>
                        <th className="px-5 py-3.5 font-bold text-gray-600 text-center">تقييم SEO</th>
                        <th className="px-5 py-3.5 font-bold text-gray-600">الحالة</th>
                        <th className="px-5 py-3.5 font-bold text-gray-600 text-left">أدوات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {filteredArticles.map((article) => (
                        <tr 
                          key={article.id} 
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                          onClick={() => handleViewArticle(article)}
                        >
                          <td className="px-5 py-4 max-w-md">
                            <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {article.title}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              {article.category && (
                                <>
                                  <span className="font-bold bg-blue-50 text-blue-700 border border-blue-100/50 px-1.5 py-0.5 rounded text-[10px]">
                                    📂 {article.category}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span className="font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
                                {article.language === 'ar' ? 'العربية' : 'English'}
                              </span>
                              <span>•</span>
                              <span>الموضوع: "{article.topic}"</span>
                              <span>•</span>
                              <span>{article.wordCount} كلمة</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {article.keywords.map((kw, idx) => (
                                <span key={idx} className="bg-slate-15 bg-slate-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                  {kw}
                                </span>
                              ))}
                              {article.keywords.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs shadow-3xs ${
                              article.seoScore >= 90
                                ? 'bg-green-100 text-green-700'
                                : article.seoScore >= 80
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {article.seoScore}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {article.status === 'published' ? (
                              <div className="flex flex-col">
                                <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  منشور على المدونة
                                </span>
                                {article.publishedAt && (
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(article.publishedAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                            ) : article.status === 'scheduled' ? (
                              <div className="flex flex-col">
                                <span className="text-blue-600 font-semibold text-xs flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                                  مجدول للنشر
                                </span>
                                {article.scheduledAt && (
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    أوتوماتيكياً: {new Date(article.scheduledAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })} - {new Date(article.scheduledAt).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-semibold text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                مسودة محلية
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-left" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewArticle(article)}
                                className="p-1 px-2 hover:bg-slate-200 text-slate-700 rounded-md text-xs transition-colors font-medium flex items-center gap-1"
                                title="عرض وتعديل"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>عرض</span>
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* List Footer with Scheduler state logs */}
              <div className="p-3 bg-slate-50 border-t border-gray-100 text-[11px] text-slate-500 flex justify-between items-center px-5 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  جدولة ووردبريس الخلفية نشطة وتفحص كل 20 ثانية تلقائياً.
                </span>
                <span>آخر فحص وتزامن للمدونة: {lastCheckTime}</span>
              </div>
            </div>
          ) : activeTab === 'scheduler' ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 p-6">
              <Scheduler 
                tasks={scheduledTasks}
                onSchedule={handleScheduleTask}
                onDelete={handleDeleteTask}
                isScheduling={isGenerating}
              />
            </div>
          ) : activeTab === 'profile' ? (
            /* USER PROFILE VIEW */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 p-6 sm:p-8 space-y-6">
              {/* Banner design representing content creator status */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-150">
                <div className="relative group shrink-0">
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.name}
                    onError={(e) => {
                      // fallback if invalid URL
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                    }}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-1.5 flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                  <p className="text-xs font-bold text-blue-600 bg-blue-50/85 rounded-full px-3 py-1 inline-block">{userProfile.role}</p>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-lg mt-1">{userProfile.bio}</p>
                </div>

                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile statistics / info overview column */}
                <div className="md:col-span-1 space-y-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-2">تفاصيل العضوية</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-405 text-gray-400">حالة الحساب</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          نشط مدى الحياة
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">تاريخ الانضمام</span>
                        <span className="font-bold text-gray-700">{userProfile.joinedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">دور المستخدم</span>
                        <span className="font-bold text-gray-700">{userProfile.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">المدونات المتصلة</span>
                        <span className="font-bold text-blue-600">
                          {wpSites.length > 0 ? `${wpSites.length} مدونة نشطة` : 'لا يوجد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">قاعدة البيانات</span>
                        <span className={`font-bold ${dbStatus.isConnected ? 'text-emerald-600' : dbStatus.isMongoDB ? 'text-red-500' : 'text-slate-600'}`}>
                          {dbStatus.type === 'MongoDB Cloud' ? 'قاعدة MongoDB' : 'JSON محلي'} ({dbStatus.isMongoDB ? (dbStatus.isConnected ? 'متصلة' : 'عطل') : 'نشطة'})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">مجموع المقالات</span>
                        <span className="font-bold text-gray-700">{articles.length} مقالاً</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      🚀 نصيحة السيو اليومية:
                    </h4>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      تحويل المقال إلى محتوى صوتي (Podcast) يضمن تحسين كفاءة الصفحة وبقاء الزوار لفترات أطول، مما يرسل إشارات إيجابية قوية لخوارزميات محرك بحث جوجل لرفع رتبة موقعك!
                    </p>
                  </div>
                </div>

                {/* Detailed edit form column */}
                <div className="md:col-span-2 space-y-5">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const updated = {
                      name: formData.get('p_name') as string,
                      email: formData.get('p_email') as string,
                      role: formData.get('p_role') as string,
                      bio: formData.get('p_bio') as string,
                      avatarUrl: formData.get('p_avatar') as string,
                      joinedAt: userProfile.joinedAt
                    };
                    handleUpdateProfile(updated);
                    alert('تم حفظ بيانات الملف التعريفي بنجاح!');
                  }} className="space-y-4">
                    
                    <h3 className="text-sm font-bold text-gray-800 border-b pb-2">تعديل الملف التعريفي</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الكامل</label>
                        <input
                          type="text"
                          name="p_name"
                          required
                          defaultValue={userProfile.name}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">المسمى الوظيفي والدور</label>
                        <input
                          type="text"
                          name="p_role"
                          required
                          defaultValue={userProfile.role}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">البريد الإلكتروني للبروفايل</label>
                        <input
                          type="email"
                          name="p_email"
                          required
                          defaultValue={userProfile.email}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-left font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">رابط صورة الأفاتار (Avatar URL)</label>
                        <input
                          type="url"
                          name="p_avatar"
                          required
                          defaultValue={userProfile.avatarUrl}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-left font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">النبذة الشخصية (Bio)</label>
                      <textarea
                        name="p_bio"
                        required
                        rows={3}
                        defaultValue={userProfile.bio}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white leading-relaxed resize-none text-right"
                      />
                    </div>

                    <div className="space-y-4 pt-3 border-t">
                      <h4 className="text-xs font-bold text-gray-800">تحديث أمان الحساب (تغيير كلمة المرور)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">كلمة المرور الحالية</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-left focus:outline-hidden text-right"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">كلمة المرور الجديدة</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium text-left focus:outline-hidden text-right"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('dashboard')}
                        className="px-4 py-2 border border-gray-250 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        العودة للرئيسية
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        حفظ التغييرات بالكامل
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            </div>
          ) : (
            /* AI GENERATION VIEW FORM */
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-500 border border-amber-100">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">المولّد التلقائي للمقالات الحصرية المتوافقة مع السيو</h2>
                  <p className="text-sm text-gray-500">استخدم نموذج Gemini-3.5-flash المتطور لصياغة موضوعات فريدة وملتزمة بمعايير الفهرسة</p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    عنوان المقال أو الفكرة الأساسية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="مثال: أهمية استخدام نظم الطاقة المتجددة في المنازل الحديثة لدعم البيئة"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all text-right font-medium"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">كلما كان العنوان معبراً وواضحاً، أنتج الذكاء الاصطناعي محتوىً منسقاً وعميقاً لموقعك.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    الكلمات المفتاحية المستهدفة (SEO Focus Keywords)
                  </label>
                  <input
                    type="text"
                    value={genKeywords}
                    onChange={(e) => setGenKeywords(e.target.value)}
                    placeholder="ضع الكلمات مفصولة بفاصلة مثل: طاقة شمسية, توفير فواتير الكهرباء, المنازل الذكية"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all text-right font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">سيتم دمج هذه الكلمات بنسبة توزيع سيو مدروسة وطبيعية داخل العناوين الفرعية وفقرات المقال.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    تصنيف المقال (Category)
                  </label>
                  <input
                    type="text"
                    value={genCategory}
                    onChange={(e) => setGenCategory(e.target.value)}
                    placeholder="مثال: ذكاء اصطناعي، سيو وتقنيات، الصحة، أسرة"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all text-right font-medium"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">تصنيف من فضلك لتنظيم مقالاتك في لوحة التحكم وتسهيل العثور عليها وتصفيتها لاحقاً.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">لغة المقال المولَّد</label>
                    <select
                      value={genLanguage}
                      onChange={(e) => setGenLanguage(e.target.value as 'ar' | 'en')}
                      className="w-full bg-slate-50 border border-gray-200 p-2.5 rounded-lg text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">الإنجليزية (English)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">أسلوب ونبرة الكتابة (Tone)</label>
                    <select
                      value={genTone}
                      onChange={(e) => setGenTone(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 p-2.5 rounded-lg text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    >
                      <option value="professional">إحترافي (Professional)</option>
                      <option value="educational">تعليمي وشرح مبسط</option>
                      <option value="creative">إبداعي ومنسق (Creative)</option>
                      <option value="marketing">تسويقي وجذاب (Marketing)</option>
                      <option value="friendly">ودي وشخصي (Friendly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">طول وعمق المقال المستهدف</label>
                    <select
                      value={genLength}
                      onChange={(e) => setGenLength(e.target.value as 'short' | 'medium' | 'long')}
                      className="w-full bg-slate-50 border border-gray-200 p-2.5 rounded-lg text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    >
                      <option value="short">قصير (400 - 600 كلمة)</option>
                      <option value="medium">متوسط (700 - 1000 كلمة)</option>
                      <option value="long">تفصيلي عميق (1200+ كلمة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">عدد العناوين الفرعية (H2)</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={genSubheadings}
                      onChange={(e) => setGenSubheadings(parseInt(e.target.value) || 4)}
                      className="w-full bg-slate-50 border border-gray-200 p-2.5 rounded-lg text-sm font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white text-center"
                    />
                  </div>
                </div>

                {genError && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700 flex items-start gap-2.5 antialiased">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">حدث خطأ في عملية الإنتاج:</span>
                      <span>{genError}</span>
                      <span className="block mt-1 text-xs text-red-650 font-medium">ملاحظة: تأكد من إعداد مفتاح API الخاص بـ Gemini بشكل صحيح في إعدادات Secrets بالمنصة.</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    صِفْ واكتب المقال بالذكاء الاصطناعي ✨
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-3 rounded-lg transition-all"
                  >
                    إلغاء والعودة
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* LEFT/Sidebar Section column: Connection Config & Pricing */}
        <div className="w-full lg:w-80 flex flex-col space-y-6 shrink-0">
          
          {/* Quick connection config widget styled as in Professional Polish */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 px-1.5 bg-blue-50 rounded-md text-blue-600">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 text-md">ربط ووردبريس (WordPress)</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              اربط مدونتك الشخصية أو موقعك الإخباري عبر استخدام <span className="font-semibold text-gray-700">كلمات مرور التطبيقات (Application Passwords)</span> لنشر فوري وبشكل مجدول تلقائياً.
            </p>

            <form onSubmit={handleConnectWP} className="space-y-3.5">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 mb-1">اسم تعريفي اختياري للمدونة</label>
                <input
                  type="text"
                  placeholder="مثال: مدونة الصحة الرقمية"
                  value={inputSiteName}
                  onChange={(e) => setInputSiteName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-sans"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 mb-1">رابط موقع الووردبريس (Site URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://techmagazine.me"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-mono text-left"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 mb-1">اسم المستخدم بووردبريس</label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs text-left"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 mb-1">كلمة مرور التطبيق (Application Password)</label>
                <input
                  type="password"
                  placeholder={wpConfig.isConnected ? "•••• •••• •••• ••••" : "xxxx xxxx xxxx xxxx"}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs text-left font-mono"
                />
                <span className="text-[9px] text-gray-400 mt-1 leading-tight">احصل عليها من لوحة تحكم ووردبريس &gt; أعضاء &gt; ملفك الشخصي &gt; كلمات مرور التطبيقات.</span>
              </div>

              {connectMessage.text && (
                <div className={`p-2.5 rounded-lg text-xs leading-normal flex items-start gap-1.5 ${
                  connectMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200/50'
                    : 'bg-red-50 text-red-700 border border-red-200/50'
                }`}>
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{connectMessage.text}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  ربط وحفظ المدونة ⚡
                </button>
                {wpSites.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDisconnectWP}
                    className="border border-red-200 text-red-650 hover:bg-red-50 p-2 rounded-lg text-xs transition-all"
                    title="قطع اتصال كافة المدونات"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Connected blogs lists */}
            {wpSites && wpSites.length > 0 && (
              <div className="pt-4 border-t border-gray-150 space-y-2 mt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">المدونات المتصلة النشطة ({wpSites.length})</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {wpSites.map((site) => (
                    <div key={site.id} className="bg-slate-50 border border-gray-150 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-gray-800 truncate">{site.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${site.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} title={site.isConnected ? 'متصل بالووردبريس وحالة الاتصال نشطة' : 'الاتصال غير نشط - يرجى مراجعة بيانات الاعتماد المضافة'}></span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono truncate block" dir="ltr">{site.siteUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDisconnectWPSite(site.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition shrink-0"
                        title="حذف الارتباط"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick parameters simulation card strictly mimicking the mockup blueprint */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">شروط النشر السريع الافتراضي</h4>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-650">إضافة صور تلقائية</span>
                <div className="w-9 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-650">تفعيل الروابط الداخلية بقواعد SEO</span>
                <div className="w-9 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-650">نشر فوري آلي على ووردبريس</span>
                <div className="w-9 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Banner matching exactly the professional navy style blueprint */}
          <div className="bg-blue-900 rounded-xl p-5 text-white overflow-hidden relative shadow-md">
            <div className="relative z-10">
              <h3 className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400 animate-bounce" />
                الخطة الاحترافية (Plus Pro)
              </h3>
              <p className="text-[11px] text-blue-200 mb-3.5 leading-normal">
                باقي 125 مقال من أصل 500 لهذا الشهر. قم بالترقية للحصول على عدد غير محدود من إنتاج المقالات الذكية وسجلات أرشفة غير محددة.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-white text-blue-900 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-50 transition-all shadow-xs"
              >
                ترقية حسابك الآن
              </button>
            </div>
            {/* Absolute visual sphere accent */}
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-blue-800 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>

      {/* ARTICLE DRAWER / VIEW & DETAILS MODAL SCREEN */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-150 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1 px-2.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  SEO {selectedArticle.seoScore}/100
                </div>
                <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                  {isEditing ? 'تعديل مسودة المقال' : selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-xs font-bold"
              >
                إغلاق (X)
              </button>
            </div>

            {/* Modal Content - Scrollable split panel */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Document/Aritcle editing/previewing canvas */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto border-l border-gray-100">
                
                {isEditing ? (
                  // EDITABLE TEXTFIELDS FORM
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">عنوان المقال الرئيسي (Title)</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">تصنيف المقال (Category)</label>
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="عام"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-hidden focus:border-blue-500 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">مقتطف شبكات التواصل (Excerpt)</label>
                      <textarea
                        rows={2}
                        value={editExcerpt}
                        onChange={(e) => setEditExcerpt(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs leading-relaxed focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">وصف سيو ميتا (Meta Description) - لنتائج جوجل</label>
                      <input
                        type="text"
                        value={editMetaDescription}
                        onChange={(e) => setEditMetaDescription(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                        <span>الطول المفضل: 120 إلى 160 حرفاً</span>
                        <span className={editMetaDescription.length >= 120 && editMetaDescription.length <= 165 ? 'text-green-600 font-bold' : 'text-amber-500'}>
                          عدد الحروف الحالي: {editMetaDescription.length}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-900 uppercase border-b border-gray-100 pb-1 mb-3">فقرات وعناوين المقال (Sections)</label>
                      <div className="space-y-4">
                        {editSections.map((sec, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-gray-150">
                            <input
                              type="text"
                              value={sec.heading}
                              onChange={(e) => {
                                const copy = [...editSections];
                                copy[idx].heading = e.target.value;
                                setEditSections(copy);
                              }}
                              placeholder={`عنوان الفقرة الفرعي ${idx + 1}`}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold mb-2 text-gray-800"
                            />
                            <textarea
                              rows={5}
                              value={sec.content}
                              onChange={(e) => {
                                const copy = [...editSections];
                                copy[idx].content = e.target.value;
                                setEditSections(copy);
                              }}
                              placeholder="محتوى وصياغة فقرة المقالة التفصيلي..."
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs leading-relaxed text-gray-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // HUMAN READING PREVIEW CANVAS
                  <div className="prose prose-blue max-w-none space-y-4 text-gray-800">
                    {selectedArticle.category && (
                      <span className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-100/80">
                        📁 التصنيف: {selectedArticle.category}
                      </span>
                    )}
                    <h1 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">
                      {selectedArticle.title}
                    </h1>
                    
                    <div className="text-xs bg-[#F8FAFC] border border-gray-200/60 p-4 rounded-xl leading-relaxed text-gray-600">
                      <span className="font-bold block text-gray-800 mb-1">💡 مقتطف ميتا SEO للشبكات وجوجل:</span>
                      <p className="font-mono">{selectedArticle.metaDescription}</p>
                    </div>

                    <p className="text-sm font-semibold text-gray-500 italic border-r-3 border-blue-400 pr-3">
                      {selectedArticle.excerpt}
                    </p>

                    <hr className="border-gray-100" />

                    {/* Featured Image Generation Feature */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900">صورة المقال المميزة</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">إنشاء صورة غلاف جذابة باستخدام الذكاء الاصطناعي</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleGenerateImage(selectedArticle.id)}
                          disabled={isGeneratingImage}
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3" />}
                          {isGeneratingImage ? 'جاري الإنشاء...' : 'إنشاء صورة'}
                        </button>
                      </div>
                      {imageMessage.text && (
                        <p className={`text-[10px] sm:text-xs ${imageMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {imageMessage.text}
                        </p>
                      )}
                      
                      {selectedArticle.featuredImageUrl && (
                        <div className="mt-4">
                          <img 
                            src={selectedArticle.featuredImageUrl} 
                            alt="Featured" 
                            className="w-full h-auto rounded-lg shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Multi-Media Podcast Attachment Feature */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Headphones className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900">نسخة البث الصوتي (Podcast) للمقال</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">تحويل المقال المكتوب إلى تعليق صوتي ذكي بالذكاء الاصطناعي</p>
                          </div>
                        </div>

                        {!selectedArticle.audioUrl ? (
                          <button
                            onClick={() => handleGeneratePodcast(selectedArticle.id)}
                            disabled={isGeneratingPodcast}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            {isGeneratingPodcast ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mic className="w-3.5 h-3.5" />
                            )}
                            {isGeneratingPodcast ? 'جاري تحضير البث...' : 'توليد البودكاست'}
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGeneratePodcast(selectedArticle.id)}
                              disabled={isGeneratingPodcast}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              {isGeneratingPodcast ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mic className="w-3 h-3" />
                              )}
                              إعادة توليد
                            </button>
                            <button
                              onClick={() => handleDeletePodcast(selectedArticle.id)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف المرفق
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status alerts inside the podcast block */}
                      {podcastMessage.text && (
                        <div className={`text-[11px] p-2.5 rounded-lg flex items-center gap-2 ${
                          podcastMessage.type === 'error'
                            ? 'bg-rose-50 text-rose-800 border border-rose-100'
                            : 'bg-green-50 text-green-800 border border-green-100'
                        }`}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{podcastMessage.text}</span>
                        </div>
                      )}

                      {/* Explicit Interactive Audio Player */}
                      {selectedArticle.audioUrl ? (
                        <div className="space-y-3.5">
                          <div className="bg-white border border-gray-150 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-[11px] font-bold text-gray-600">المرفق الصوتي نشط وجاهز للاستماع</span>
                            </div>
                            
                            <audio 
                              key={selectedArticle.audioUrl} // Key forces reload if source shifts
                              controls 
                              className="w-full sm:w-64 h-8 text-xs focus:outline-hidden"
                            >
                              <source src={selectedArticle.audioUrl} type="audio/wav" />
                              متصفحك لا يدعم مشغلات الصوت بشكل مباشر.
                            </audio>
                          </div>

                          {/* Show/Hide Narration Speech script */}
                          {selectedArticle.podcastScript && (
                            <div className="bg-white border border-gray-150 rounded-lg p-3 space-y-2">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                                النص الحواري الملقى في البودكاست:
                              </span>
                              <p className="text-xs text-gray-600 leading-relaxed font-mono whitespace-pre-wrap max-h-24 overflow-y-auto bg-slate-50 p-2.5 rounded border border-gray-100">
                                {selectedArticle.podcastScript}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-200 bg-white rounded-lg p-4 text-center text-xs text-slate-400">
                          لا يوجد مرفق صوتي حالياً للمقال. اضغط على الزر أعلاه لتوليد بودكاست حصري بالذكاء الاصطناعي وبثه!
                        </div>
                      )}
                    </div>

                    <div className="space-y-6 pt-2">
                      {selectedArticle.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-2">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 border-r-2 border-slate-700 pr-2">
                            {sec.heading}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar SEO report cards & publishing schedulers */}
              <div className="w-full md:w-80 bg-slate-50/50 p-5 overflow-y-auto space-y-5">
                
                {/* 1. Real-time SEO checks Checklist */}
                <div className="bg-white rounded-lg border border-gray-150 p-4 shadow-2xs">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">نقاط جودة السيو (SEO Audit)</h4>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl font-black text-blue-600">
                      {isEditing 
                        ? recalculateSeoScore(editTitle, editMetaDescription, editKeywords, editSections)
                        : selectedArticle.seoScore
                      }
                      <span className="text-xs font-semibold text-gray-400">/100</span>
                    </div>
                    <span className="text-xs text-gray-500">تقييم الخوارزمية الفوري</span>
                  </div>

                  {/* Individual criteria checklist */}
                  <div className="space-y-2 text-xs">
                    {getSubChecklist(
                      isEditing ? editTitle : selectedArticle.title,
                      isEditing ? editMetaDescription : selectedArticle.metaDescription,
                      selectedArticle.keywords,
                      isEditing ? editSections : selectedArticle.sections
                    ).map((chk) => (
                      <div key={chk.id} className="flex items-start gap-2">
                        {chk.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5 flex items-center justify-center text-[8px] text-gray-500"></div>
                        )}
                        <div>
                          <span className={`${chk.passed ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>
                            {chk.titleAr}
                          </span>
                          <span className="block text-[9px] text-gray-400">{chk.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Post metadata list details */}
                <div className="bg-white rounded-lg border border-gray-150 p-4 shadow-2xs space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">تاريخ الإنشاء:</span>
                    <span className="font-medium">
                      {new Date(selectedArticle.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">النبرة والقالب:</span>
                    <span className="font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                      {selectedArticle.tone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">عدد الكلمات:</span>
                    <span className="font-semibold">{selectedArticle.wordCount} كلمة</span>
                  </div>
                  {/* Backward compatibility and multi site publish links */}
                  {((selectedArticle.publishedSites && selectedArticle.publishedSites.length > 0) || (selectedArticle.wordpressUrl && selectedArticle.wordpressUrl !== '#')) && (
                    <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 block">تفاصيل النشر والمزامنة:</span>
                      
                      {selectedArticle.publishedSites && selectedArticle.publishedSites.length > 0 ? (
                        <div className="space-y-1">
                          {selectedArticle.publishedSites.map((pubSite, pIdx) => (
                            <a
                              key={pIdx}
                              href={pubSite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 font-bold bg-blue-50/40 p-1.5 rounded border border-blue-100/50"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="truncate">
                                <strong>{pubSite.siteName}</strong>
                              </span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <a
                          href={selectedArticle.wordpressUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          رابط المنشور في ووردبريس
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Scheduling & Publishing Tool card */}
                <div className="bg-white rounded-lg border border-gray-150 p-4 shadow-2xs space-y-3">
                  <h4 className="font-bold text-xs text-slate-700">بوابة النشر المشترك والجدولة المتعددة</h4>
                  
                  {/* Select target sites for publishing */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">المدونات المتصلة المستهدفة للنشر</label>
                    {wpSites && wpSites.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-100 p-2 rounded-lg bg-slate-50">
                        {wpSites.map((site) => {
                          const isChecked = selectedSiteIdsForPublish.includes(site.id);
                          const isAlreadyPublishedOnThisSite = selectedArticle.publishedSites?.some((ps: any) => ps.siteId === site.id);
                          return (
                            <div key={site.id} className="flex items-center gap-2 text-xs">
                              <input
                                id={`target-site-${site.id}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedSiteIdsForPublish(prev => 
                                    prev.includes(site.id) ? prev.filter(x => x !== site.id) : [...prev, site.id]
                                  );
                                }}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <label htmlFor={`target-site-${site.id}`} className="flex-1 flex justify-between items-center cursor-pointer select-none">
                                <span className={isAlreadyPublishedOnThisSite ? 'text-gray-400 font-bold' : 'font-semibold text-gray-700'}>
                                  {site.name}
                                </span>
                                {isAlreadyPublishedOnThisSite ? (
                                  <span className="text-[9px] bg-green-50 text-green-700 px-1 py-0.5 rounded border border-green-200">منشور سابقاً</span>
                                ) : (
                                  <span className="text-[9px] text-gray-400 font-mono font-light truncate max-w-[100px]" dir="ltr">{new URL(site.siteUrl).hostname}</span>
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 leading-relaxed bg-slate-50 p-2 rounded-lg border border-dashed border-gray-200">
                        لم يتم ربط أي مدونة متعددة بعد. سيتم النشر على المخدم التجريبي الافتراضي. لربط مدونة، اذهب لصفحة البروفايل.
                      </div>
                    )}
                  </div>

                  {/* Date selection input for schedule configuration */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">تاريخ ووقت جدولة النشر المشترك</label>
                      <button
                        type="button"
                        disabled={isAnalyzingSchedule}
                        onClick={() => handleFetchScheduleSuggestion(selectedArticle.id)}
                        className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {isAnalyzingSchedule ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            جاري التحليل...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                            اقتراح أفضل وقت 🪄
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 p-2 rounded-md text-xs font-mono text-center focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />

                    {/* Integrated Intelligent Auto Suggestion Explanatory Report */}
                    {scheduleSuggestion && (
                      <div className="mt-2 text-[11px] bg-slate-50 border border-slate-150 p-3 rounded-lg space-y-2 text-slate-700 leading-relaxed font-sans shadow-2xs">
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-800 block mb-0.5">مستشار الجدولة السيو الذكي:</span>
                            <p className="text-slate-600 text-[11px]">{scheduleSuggestion.explanation}</p>
                          </div>
                        </div>

                        {/* Historical peak analysis visualization list */}
                        {scheduleSuggestion.analytics && scheduleSuggestion.analytics.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 text-[10px] space-y-1">
                            <span className="font-extrabold text-slate-400 uppercase tracking-wider block mb-1">بيانات تحليل الذروة والتفاعل:</span>
                            <div className="space-y-1">
                              {scheduleSuggestion.analytics.map((past, pIdx) => (
                                <div key={pIdx} className="flex justify-between items-center text-slate-500 py-1 px-1.5 bg-white rounded border border-slate-100 gap-2">
                                  <span className="truncate flex-1 font-medium" title={past.title}>{past.title}</span>
                                  <span className="font-mono text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded shrink-0">ذروة {past.peakHour} | {past.engagementRate}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {publishMessage && (
                    <div className="space-y-2">
                      <div className={`p-2.5 border rounded-lg text-xs leading-relaxed ${canBypassPublish ? 'bg-red-50 border-red-150 text-red-700' : 'bg-blue-50 border-blue-150 text-blue-700'}`}>
                        {publishMessage}
                      </div>
                      {canBypassPublish && (
                        <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs space-y-2 leading-relaxed">
                          <p className="font-extrabold text-slate-800">💡 ترغب في تجربة دورة النشر محلياً؟</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            نظراً لعدم وجود موقع وردبريس خارجي نشط بالبيانات المدخلة، يمكنك تخطي محاولة الاتصال وتحديث حالة هذا المقال في قاعدة البيانات المحلية المشتركة فوراً إلى <strong>"منشور"</strong> لتحديث عدادات لوحة الإحصائيات وعرض التحليلات الذكية.
                          </p>
                          <button
                            type="button"
                            onClick={handleLocalBypassPublish}
                            disabled={isPublishingNow}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] py-2 px-2.5 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                          >
                            تجاوز المشكلة والنشر بقاعدة البيانات 💾
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 pt-1.5 border-t border-gray-100">
                    <button
                      onClick={() => handlePublishOrSchedule(true)}
                      disabled={isPublishingNow}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isPublishingNow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      نشر فوري الآن 🚀
                    </button>

                    <button
                      onClick={() => handlePublishOrSchedule(false)}
                      disabled={isPublishingNow || !scheduleDate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      حفظ وجدولة النشر
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom control buttons bar */}
            <div className="p-4 border-t border-gray-150 bg-slate-50/50 flex flex-wrap gap-2 justify-between shrink-0">
              <div>
                <button
                  type="button"
                  onClick={() => handleDeleteArticle(selectedArticle.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-650 text-red-600 font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف المقال نهائياً
                </button>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdits}
                      disabled={isSavingLocal}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isSavingLocal ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      حفظ وحفظ التعديلات
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form fields
                        setEditTitle(selectedArticle.title);
                        setEditExcerpt(selectedArticle.excerpt);
                        setEditMetaDescription(selectedArticle.metaDescription);
                        setEditSections(JSON.parse(JSON.stringify(selectedArticle.sections)));
                      }}
                      className="border border-gray-250 text-gray-600 text-xs px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-medium"
                    >
                      إلغاء التعديل
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تعديل محتوى المسودة
                    </button>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 text-xs px-4 py-2.5 rounded-lg transition-all font-semibold"
                    >
                      إغلاق ومعاودة لاحقاً
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* AI GENERATING SPARKLY TRANSITION STEP-BY-STEP DIALOG */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-amber-400 animate-pulse"></div>
            
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-md">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-white">جاري توليد مقالك الحصري الآن...</h3>
              <p className="text-xs text-gray-400">تقوم خوارزمية Gemini-3.5 بتحليل موضوعك وصياغة الفقرات وتوزيع الكلمات المفتاحية.</p>
            </div>

            {/* Simulated generation progress steps animation strictly fulfilling user requirement for beautiful interaction cues */}
            <div className="space-y-3.5 text-right max-w-xs mx-auto text-xs pb-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${generationStep >= 1 ? 'bg-green-500' : 'bg-slate-700'} transition-all`}></span>
                <span className={`${generationStep >= 1 ? 'text-green-400 font-bold' : 'text-gray-500'}`}>1. فحص وتحليل الفكرة والكلمات المفتاحية</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${generationStep >= 2 ? 'bg-green-500' : 'bg-slate-700'} transition-all`}></span>
                <span className={`${generationStep >= 2 ? 'text-green-400 font-bold' : 'text-gray-500'}`}>2. توليد هيكل العناوين الجانبية (H2/H3) المتوافقة</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${generationStep >= 3 ? 'bg-green-500' : 'bg-slate-700'} transition-all`}></span>
                <span className={`${generationStep >= 3 ? 'text-green-400 font-bold' : 'text-gray-500'}`}>3. تحرير المحتوى الحصري ومراجعة الصياغة</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${generationStep >= 4 ? 'bg-amber-400 animate-ping' : 'bg-slate-700'} transition-all`}></span>
                <span className={`${generationStep >= 4 ? 'text-amber-300 font-bold' : 'text-gray-500'}`}>4. حساب مستوى الـ SEO وضبط وصف الأرشفة</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 bg-slate-950 p-2 rounded-lg font-mono leading-relaxed">
              * تستغرق هذه العملية حوالي 10 إلى 15 ثانية كحد أقصى للانتهاء.
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE DIALOG SIMULATOR MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 sm:p-8 max-w-md w-full relative text-center space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-gray-900">الترقية إلى باقة AutoWrite الاحترافية Unlimited</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                استمتع بإنتاج وتوليد مقالات سيو متزامنة غير محدودة لعدد لا نهائي من مدونات ومواقع ووردبريس مع أداة مساعدة متطورة للصور والروابط الداخلية.
              </p>
            </div>

            {/* Pricing details */}
            <div className="bg-[#F8FAFC] border border-gray-150 p-4 rounded-xl">
              <span className="block text-xs text-gray-400 font-medium">سعر الاشتراك الشهري</span>
              <span className="text-3xl font-black text-gray-900">29$</span>
              <span className="text-xs text-gray-500 font-bold"> / شهرياً</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  alert('شكراً لاهتمامك! تم تسجيل طلب الترقية للخطة الاحترافية بنجاح وجاري إعداد تفاصيل الفوترة وتفعيل المزايا لحسابك.');
                  setShowUpgradeModal(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs"
              >
                تأكيد وبدء التجربة المجانية 💳
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-semibold"
              >
                إغلاق و معاودة لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
