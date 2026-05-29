import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Article } from '../types';

export default function SeoGrowthChart({ articles }: { articles: Article[] }) {
  const data = useMemo(() => {
    return articles
      .filter(a => a.status === 'published' && a.publishedAt)
      .map(a => ({
        date: new Date(a.publishedAt!).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' }),
        seoScore: a.seoScore
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [articles]);

  if (data.length < 2) return <div className="text-xs text-gray-500 py-10 text-center border-t border-gray-100 mt-4">لا توجد بيانات كافية لرسم منحنى النمو (تحتاج لمقالين منشورين على الأقل).</div>;

  return (
    <div className="h-64 mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-xs font-bold text-gray-600 mb-4 px-5">نمو نقاط السيو للمقالات المنشورة بمرور الوقت</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{fontSize: 10}} />
          <YAxis domain={[0, 100]} tick={{fontSize: 10}} />
          <Tooltip contentStyle={{fontSize: '12px'}} />
          <Line type="monotone" dataKey="seoScore" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
