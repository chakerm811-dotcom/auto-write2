/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import { Article, WordPressConfig, WordPressSite, ScheduledTask } from './src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DbSchema {
  articles: Article[];
  wordpressConfig: WordPressConfig;
  wordpressSites?: WordPressSite[];
  scheduledTasks?: ScheduledTask[];
}

const DEFAULT_DB: DbSchema = {
  articles: [
    {
      id: 'demo-1',
      topic: 'أفضل أدوات الذكاء الاصطناعي لتوليد المحتوى عام 2026',
      category: 'ذكاء اصطناعي',
      language: 'ar',
      keywords: ['أدوات الذكاء الاصطناعي', 'كتابة المحتوى', 'توليد المقالات'],
      tone: 'professional',
      title: 'أفضل 10 أدوات ذكاء اصطناعي لكتابة المحتوى وتوليد المقالات الحصرية لعام 2026',
      metaDescription: 'تعرف على أفضل أدوات الذكاء الاصطناعي لتوليد المقالات المتوافقة مع السيو، وكيف تساعدك في تصدر نتائج البحث تلقائياً وبكفاءة عالية.',
      excerpt: 'نشهد في عام 2026 تميزاً هائلاً في جودة المحتوى العربي المنتج بالذكاء الاصطناعي بفضل نماذج الجيل الثالث التوليدية. نستعرض هنا تفاصيل أفضل الأنظمة.',
      sections: [
        {
          heading: 'ثورة الأتمتة وكتابة المحتوى الرقمي المبتكر',
          content: 'أصبحت صناعة المحتوى تتطلب مجهوداً مستمراً في تقديم المقالات الحصرية التي تلائم عقلية محركات البحث وميول القارئ البشري معاً. هنا يأتي دور أدوات كتابة المقالات بالذكاء الاصطناعي, التي تطورت لتقدم صياغة احترافية خالية من الركاكة والأخطاء الإملائية الشائعة.'
        },
        {
          heading: 'أبرز مميزات منصات التوليد المتوافقة مع السيو SEO',
          content: 'لا تقتصر هذه المنصات على توليد الكلمات العشوائية، بل تقوم بتحليل الكلمات المفتاحية الأكثر رواجاً، وتوزيعها بذكاء داخل العناوين الرئيسية (H2) والفرعية (H3) والفقرات الأولى، مما يمنح مقالاتك دفعة قوية للظهور في الصفحة الأولى لجوجل بأسلوب حصري تماماً.'
        }
      ],
      contentMarkdown: '# أفضل 10 أدوات ذكاء اصطناعي لكتابة المحتوى وتوليد المقالات الحصرية لعام 2026\n\n## ثورة الأتمتة وكتابة المحتوى الرقمي المبتكر\nأصبحت صناعة المحتوى تتطلب مجهوداً مستمراً في تقديم المقالات الحصرية التي تلائم عقلية محركات البحث وميول القارئ البشري معاً...\n\n## أبرز مميزات منصات التوليد المتوافقة مع السيو SEO\nلا تقتصر هذه المنصات على توليد الكلمات العشوائية، بل تقوم بتحليل الكلمات المفتاحية الأكثر رواجاً...',
      seoScore: 98,
      wordCount: 540,
      status: 'published',
      scheduledAt: null,
      publishedAt: '2026-05-28T16:00:00.000Z',
      wordpressPostId: 104,
      wordpressUrl: 'https://demo-site.com/best-ai-content-tools-2026',
      createdAt: '2026-05-28T15:30:00.000Z'
    },
    {
      id: 'demo-2',
      topic: 'استراتيجيات تحسين السيو الداخلي للمدونات',
      category: 'سيو وتقنيات',
      language: 'ar',
      keywords: ['تحسين السيو', 'السيو الداخلي', 'SEO للمبتدئين'],
      tone: 'educational',
      title: 'دليلك الشامل لتحسين محركات البحث لموقعك وتصدر نتائج البحث',
      metaDescription: 'دليل مبسط للمبتدئين يشرح قواعد السيو الداخلي للمدونات وكيف تضمن زيادة الزيارات العضوية مجاناً باتباع خطوات واضحة.',
      excerpt: 'يعتبر السيو الداخلي ركيزة أساسية لأي موقع ناجح. إذا كنت تبحث عن تصفح أسرع وفهرسة موثوقة لمقالك الجديد، فهذا المقال يمثل دليلك الأمثل.',
      sections: [
        {
          heading: 'ما هو السيو الداخلي (On-Page SEO) ولماذا نهتم به؟',
          content: 'السيو الداخلي هو ممارسة تحسين أجزاء مختلفة من موقع الويب الخاص بك لجعله يظهر في نتائج البحث الأعلى وتأمين زيارات مستدامة. يشمل ذلك العناوين، الروابط، النصوص البديلة للصور، وسرعة الصفحة، وكثافة الكلمات المفتاحية بلغة القارئ.'
        },
        {
          heading: 'كيفية كتابة وصف سيو جذاب (Meta Description) لزيادة النقر',
          content: 'الوصف الجيد يجب أن يتراوح طوله بين 120 إلى 160 حرفاً، ويحتوي على الكلمة المفتاحية الرئيسية في البداية بشكل طبيعي، بالإضافة لنداء لاتخاذ إجراء (Call to Action) يحفز المستخدمين على الضغط للمشاهدة.'
        }
      ],
      contentMarkdown: '# دليلك الشامل لتحسين محركات البحث لموقعك وتصدر نتائج البحث\n\n## ما هو السيو الداخلي (On-Page SEO) ولماذا نهتم به؟\nالسيو الداخلي هو ممارسة تحسين أجزاء مختلفة من موقع الويب الخاص بك...\n\n## كيفية كتابة وصف سيو جذاب (Meta Description) لزيادة النقر\nالوصف الجيد يجب أن يتراوح طوله بين 120 إلى 160 حرفاً...',
      seoScore: 94,
      wordCount: 850,
      status: 'scheduled',
      scheduledAt: '2026-05-29T10:00:00.000Z',
      publishedAt: null,
      wordpressPostId: null,
      wordpressUrl: null,
      createdAt: '2026-05-28T14:20:00.000Z'
    }
  ],
  wordpressConfig: {
    siteUrl: 'https://techmagazine.me',
    username: 'admin',
    applicationPassword: 'xxxx xxxx xxxx xxxx',
    isConnected: true,
  },
};

// Global DB structures and status
let dbCache: DbSchema | null = null;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export const dbStatus = {
  isMongoDB: false,
  isConnected: false,
  type: 'Local JSON File',
  error: null as string | null
};

// Ensure data folder exists
function ensureDbExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Low-level helper to load local JSON file
function loadLocalDb(): DbSchema {
  try {
    ensureDbExists();
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as DbSchema;
  } catch (err) {
    console.error('[Database] Failed to load local JSON DB:', err);
    return DEFAULT_DB;
  }
}

// Low-level helper to write locally
function saveLocalDb(data: DbSchema) {
  try {
    ensureDbExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database] Failed to save local file database:', err);
  }
}

// MongoDB Background Save
async function saveToMongo(data: DbSchema) {
  if (!mongoDb) return;

  try {
    const articlesCol = mongoDb.collection('articles');
    const configCol = mongoDb.collection('wordpress_config');
    const sitesCol = mongoDb.collection('wordpress_sites');

    // Sync Articles
    const activeArticleIds = data.articles.map(a => a.id);
    await articlesCol.deleteMany({ id: { $nin: activeArticleIds } });

    for (const article of data.articles) {
      // Remove any _id inside the article if present, and replace
      const { ...cleanArticle } = article;
      await articlesCol.updateOne(
        { id: article.id },
        { $set: cleanArticle },
        { upsert: true }
      );
    }

    // Sync legacy base WordPress config
    await configCol.updateOne(
      { id: 'global_config' },
      { $set: data.wordpressConfig },
      { upsert: true }
    );

    // Sync WordPress multi sites
    const activeSiteIds = (data.wordpressSites || []).map(s => s.id);
    await sitesCol.deleteMany({ id: { $nin: activeSiteIds } });

    for (const site of (data.wordpressSites || [])) {
      await sitesCol.updateOne(
        { id: site.id },
        { $set: site },
        { upsert: true }
      );
    }

    dbStatus.isConnected = true;
    dbStatus.error = null;
    console.log('[Database] MongoDB cloud database synchronized successfully.');
  } catch (err: any) {
    console.error('[Database] Background save exception on MongoDB:', err);
    dbStatus.isConnected = false;
    dbStatus.error = err.message || String(err);
  }
}

// Load Mongo data on initial startup
async function loadDataFromMongo() {
  if (!mongoDb) return;

  try {
    const articlesCol = mongoDb.collection('articles');
    const configCol = mongoDb.collection('wordpress_config');
    const sitesCol = mongoDb.collection('wordpress_sites');

    const mongoArticles = await articlesCol.find({}).toArray();
    const mongoConfigs = await configCol.find({}).toArray();
    const mongoSites = await sitesCol.find({}).toArray();

    // Seed database if MongoDB is completely empty
    if (mongoArticles.length === 0 && mongoConfigs.length === 0 && mongoSites.length === 0) {
      console.log('[Database] MongoDB appears empty. Initializing and transferring data...');
      const localData = loadLocalDb();

      if (localData.articles && localData.articles.length > 0) {
        // Prevent inserting with MongoDB's inner _id values if we fetched it raw
        await articlesCol.insertMany(localData.articles.map(art => {
          const { ...copy } = art;
          return copy;
        }));
      }

      await configCol.updateOne(
        { id: 'global_config' },
        { $set: localData.wordpressConfig },
        { upsert: true }
      );

      if (localData.wordpressSites && localData.wordpressSites.length > 0) {
        await sitesCol.insertMany(localData.wordpressSites.map(site => {
          const { ...copy } = site;
          return copy;
        }));
      }

      dbCache = localData;
      console.log('[Database] Seeding successful. Synced MongoDB cloud.');
    } else {
      // Load and clean docs (remove inner mongodb _id field keys for compliance with client TS expectations)
      const articles = mongoArticles.map(m => {
        const { _id, ...rest } = m;
        return rest as Article;
      });

      let wordpressConfig = DEFAULT_DB.wordpressConfig;
      if (mongoConfigs.length > 0) {
        const { _id, id, ...rest } = mongoConfigs[0];
        wordpressConfig = rest as WordPressConfig;
      }

      const wordpressSites = mongoSites.map(m => {
        const { _id, ...rest } = m;
        return rest as WordPressSite;
      });

      dbCache = {
        articles,
        wordpressConfig,
        wordpressSites
      };

      // Ensure backup local file matches
      saveLocalDb(dbCache);
      console.log(`[Database] Hydrated ${articles.length} articles and ${wordpressSites.length} sites successfully from MongoDB.`);
    }
  } catch (err) {
    console.error('[Database] Error loading from MongoDB collections:', err);
    dbCache = loadLocalDb();
  }
}

// Main initializer called on express startup
export async function initDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] No MONGODB_URI found. Defaulting to local JSON storage files.');
    dbStatus.isMongoDB = false;
    dbStatus.isConnected = false;
    dbStatus.type = 'Local JSON File';
    dbCache = loadLocalDb();
    return;
  }

  console.log('[Database] Connecting to MongoDB URL: ', uri.replace(/:([^:@]+)@/, ':****@'));
  dbStatus.isMongoDB = true;
  dbStatus.type = 'MongoDB Cloud';

  try {
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000
    });
    
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    
    dbStatus.isConnected = true;
    dbStatus.error = null;
    console.log('[Database] Connected to MongoDB database: ', mongoDb.databaseName);

    await loadDataFromMongo();
  } catch (err: any) {
    const errMsg = err.message || String(err);
    console.error('[Database] Connection to MongoDB failed. Operating in fallback local-only:', errMsg);
    dbStatus.isConnected = false;
    dbStatus.error = errMsg;
    dbCache = loadLocalDb();
  }
}

// Sync Read
export function readDb(): DbSchema {
  if (!dbCache) {
    dbCache = loadLocalDb();
  }

  // Backup data integrity/field checking
  if (dbCache && Array.isArray(dbCache.articles)) {
    dbCache.articles = dbCache.articles.map(art => ({
      ...art,
      category: art.category || 'عام',
      publishedSites: art.publishedSites || (art.wordpressPostId ? [{
        siteId: 'site-default',
        siteUrl: dbCache!.wordpressConfig?.siteUrl || 'https://techmagazine.me',
        siteName: 'المدونة الافتراضية',
        postId: art.wordpressPostId,
        url: art.wordpressUrl || '#',
        publishedAt: art.publishedAt || new Date().toISOString()
      }] : [])
    }));
  }

  if (dbCache && !dbCache.wordpressSites) {
    dbCache.wordpressSites = [];
    if (dbCache.wordpressConfig && dbCache.wordpressConfig.siteUrl) {
      dbCache.wordpressSites.push({
        id: 'site-default',
        name: 'المدونة الافتراضية',
        siteUrl: dbCache.wordpressConfig.siteUrl,
        username: dbCache.wordpressConfig.username,
        applicationPassword: dbCache.wordpressConfig.applicationPassword,
        isConnected: dbCache.wordpressConfig.isConnected
      });
    }
  }

  return dbCache;
}

// Sync Write
export function writeDb(data: DbSchema) {
  dbCache = data;

  // Local backup
  saveLocalDb(data);

  // Background cloud MongoDB sync (non-blocking)
  if (dbStatus.isMongoDB && dbStatus.isConnected) {
    saveToMongo(data).catch(err => {
      console.error('[Database] Async MongoDB synchronization error:', err);
    });
  }
}
