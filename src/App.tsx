import React from 'react';
import { BookOpen, Calendar, Search, Download, ArrowRight, Users, TrendingUp, Brain } from 'lucide-react';

interface Journal {
  id: string;
  title: string;
  date: string;
  coverImage: string;
  downloadUrl: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

const featuredJournals: Journal[] = [
  {
    id: '1',
    title: 'মানব সম্পদ উন্নয়ন - মার্চ ২০২৪',
    date: 'মার্চ ২০২৪',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    downloadUrl: '#',
  },
  {
    id: '2',
    title: 'কর্মী ব্যবস্থাপনা - ফেব্রুয়ারি ২০২৪',
    date: 'ফেব্রুয়ারি ২০২৪',
    coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    downloadUrl: '#',
  },
];

const recentArticles: Article[] = [
  {
    id: '1',
    title: 'আধুনিক প্রতিষ্ঠানে কর্মী মূল্যায়ন পদ্ধতি',
    excerpt: 'কর্মী মূল্যায়নের আধুনিক পদ্ধতি এবং এর প্রয়োগ সম্পর্কে বিস্তারিত আলোচনা',
    date: '১০ মার্চ ২০২৪',
    readTime: '৮ মিনিট',
  },
  {
    id: '2',
    title: 'দক্ষতা উন্নয়ন কার্যক্রম',
    excerpt: 'প্রতিষ্ঠানে কর্মীদের দক্ষতা উন্নয়নের জন্য গৃহীত বিভিন্ন কার্যক্রম নিয়ে আলোচনা',
    date: '৫ মার্চ ২০২৪',
    readTime: '১২ মিনিট',
  },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HRM Journal</h1>
                <p className="text-sm text-gray-600">উন্নত মানব সম্পদ, সমৃদ্ধ প্রতিষ্ঠান</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="অনুসন্ধান করুন..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">মানব সম্পদ উন্নয়নের সর্বোচ্চ সহায়ক</h2>
            <p className="text-xl text-blue-100">আধুনিক প্রতিষ্ঠানের জন্য প্রয়োজনীয় সকল জ্ঞান ও গবেষণা একই প্ল্যাটফর্মে</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">কর্মী ব্যবস্থাপনা</h3>
              <p className="text-blue-100">আধুনিক প্রতিষ্ঠানে কর্মী ব্যবস্থাপনার সর্বোত্তম পদ্ধতি</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">কর্মদক্ষতা উন্নয়ন</h3>
              <p className="text-blue-100">কর্মীদের দক্ষতা বৃদ্ধির জন্য বিশেষ প্রশিক্ষণ পদ্ধতি</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">নেতৃত্ব বিকাশ</h3>
              <p className="text-blue-100">প্রতিষ্ঠানের নেতৃত্ব ক্ষমতা বিকাশের কৌশল</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Journals */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">সর্বশেষ জার্নাল সমূহ</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              সকল জার্নাল <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJournals.map((journal) => (
              <div key={journal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img
                  src={journal.coverImage}
                  alt={journal.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {journal.date}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{journal.title}</h3>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <Download className="h-4 w-4 mr-1" />
                    ডাউনলোড করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">সাম্প্রতিক আর্টিকেল সমূহ</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              সকল আর্টিকেল <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {article.date} • {article.readTime} পড়তে সময় লাগবে
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  বিস্তারিত পড়ুন
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-8 w-8" />
                <div>
                  <span className="text-xl font-bold">HRM Journal</span>
                  <p className="text-sm text-gray-400">উন্নত মানব সম্পদ, সমৃদ্ধ প্রতিষ্ঠান</p>
                </div>
              </div>
              <p className="text-gray-400">মানব সম্পদ উন্নয়নের জন্য বাংলাদেশের অন্যতম শীর্ষ জার্নাল</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">যোগাযোগ</h3>
              <p className="text-gray-400">ইমেইল: info@hrmjournal.com</p>
              <p className="text-gray-400">ফোন: +৮৮০ ১৭১২ ৩৪৫৬৭৮</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">দ্রুত লিঙ্ক</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">আমাদের সম্পর্কে</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">যোগাযোগ করুন</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">গোপনীয়তা নীতি</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© ২০২৪ HRM Journal - সর্বস্বত্ব সংরক্ষিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;