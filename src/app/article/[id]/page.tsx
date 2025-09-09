'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  UserIcon, 
  EyeIcon,
  ShareIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  status: 'draft' | 'published';
  author?: string;
  category?: string;
  readTime?: number;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    // Cleanup function to stop speech when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Sample articles - same as home page
    const sampleArticles: Article[] = [
      {
        id: '1',
        title: 'Local Tech Startup Raises $2M in Series A Funding',
        content: 'A local technology startup has successfully raised $2 million in Series A funding, marking a significant milestone for the company and the regional tech ecosystem. The funding round was led by prominent venture capital firms and will enable the company to expand its AI-powered platform and hire additional engineers.\n\nThe company, founded by two university graduates just three years ago, has quickly established itself as a leader in the local tech scene. Their innovative approach to artificial intelligence has attracted attention from major investors and industry leaders.\n\n"This funding represents more than just financial support," said CEO Sarah Chen. "It validates our vision and enables us to accelerate our growth while maintaining our commitment to innovation and excellence."\n\nThe Series A round was led by TechVentures Capital, with participation from several other prominent venture capital firms. The funding will be used to expand the company\'s engineering team, enhance their AI platform capabilities, and accelerate market expansion.\n\nLocal economic development officials have praised the startup\'s success as a positive indicator for the region\'s growing tech ecosystem. "This is exactly the kind of innovation and growth we want to see in our community," said Mayor Johnson.\n\nThe company plans to hire an additional 25 engineers over the next 18 months and expects to double its current workforce by the end of next year. They are also exploring opportunities for strategic partnerships with larger technology companies.',
        images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=center'],
        createdAt: new Date('2024-01-15'),
        status: 'published',
        author: 'Sarah Johnson',
        category: 'Business',
        readTime: 3
      },
      {
        id: '2',
        title: 'City Council Approves New Park Development Project',
        content: 'The city council unanimously approved the development of a new 50-acre park in the downtown area. The project, which is expected to be completed by next summer, will include walking trails, playgrounds, and a community center. Local residents have expressed strong support for the initiative.\n\nThe $12 million project represents the largest public park investment in the city\'s history. The development will transform a previously underutilized area into a vibrant community space that serves residents of all ages.\n\n"This park will be a game-changer for our downtown area," said Council Member Maria Rodriguez. "It provides much-needed green space and recreational opportunities while supporting our economic development goals."\n\nThe park will feature:\n• 3 miles of walking and biking trails\n• Multiple playground areas for different age groups\n• A community center with meeting rooms and event space\n• Native plant gardens and wildlife habitats\n• Outdoor fitness equipment\n• Picnic areas and barbecue facilities\n\nEnvironmental groups have praised the project\'s commitment to sustainability. The park will use native plants, incorporate rainwater harvesting systems, and provide habitat for local wildlife.\n\nConstruction is scheduled to begin in March, with the first phase opening to the public in June. The community center and remaining facilities will be completed by August.\n\nThe project is funded through a combination of city bonds, state grants, and private donations. Local businesses have contributed over $2 million to support the development.',
        images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center'],
        createdAt: new Date('2024-01-14'),
        status: 'published',
        author: 'Michael Chen',
        category: 'Local News',
        readTime: 4
      },
      {
        id: '3',
        title: 'Economic Indicators Show Strong Growth in Q4',
        content: 'Recent economic data reveals robust growth in the fourth quarter, with key indicators pointing to continued expansion. Employment rates have reached new highs, while consumer spending remains strong despite global economic uncertainties.\n\nThe quarterly economic report shows several positive trends:\n\nEmployment Growth: The unemployment rate dropped to 3.2%, the lowest level in over a decade. Local businesses added 2,400 new jobs during the quarter, with the technology and healthcare sectors leading the way.\n\nConsumer Confidence: Consumer spending increased by 4.2% compared to the previous quarter, driven by strong wage growth and low inflation rates. Retail sales were particularly strong during the holiday season.\n\nBusiness Investment: Corporate investment in new equipment and technology increased by 6.8%, indicating confidence in future growth prospects.\n\nHousing Market: Home sales remained steady, with median prices increasing modestly by 2.1%. The construction sector added 180 new jobs, reflecting ongoing demand for housing.\n\n"These numbers reflect the resilience and strength of our local economy," said Dr. Patricia Williams, Chief Economist at the Regional Economic Development Council. "We\'re seeing balanced growth across multiple sectors, which bodes well for continued prosperity."\n\nThe report also highlighted challenges, including rising interest rates and supply chain disruptions affecting some manufacturing sectors. However, economists remain optimistic about the region\'s economic outlook for the coming year.\n\nSmall businesses have been particularly successful, with 85% reporting increased revenue compared to the same period last year. The local chamber of commerce attributes this success to strong community support and effective business development programs.',
        images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=center'],
        createdAt: new Date('2024-01-13'),
        status: 'published',
        author: 'David Rodriguez',
        category: 'Economy',
        readTime: 5
      },
      {
        id: '4',
        title: 'Healthcare System Implements New Technology Initiative',
        content: 'The regional healthcare system has announced a comprehensive technology initiative aimed at improving patient care and operational efficiency. The program includes the implementation of advanced diagnostic tools and streamlined patient management systems.\n\nThe $8.5 million initiative represents the largest technology investment in the healthcare system\'s history. The program will modernize patient care delivery while reducing administrative burdens on medical staff.\n\nKey components of the initiative include:\n\nElectronic Health Records (EHR) Upgrade: A new, more intuitive EHR system that will improve documentation accuracy and reduce the time doctors spend on paperwork.\n\nTelemedicine Platform: Expanded virtual care capabilities that will allow patients to consult with specialists without traveling long distances.\n\nAI-Powered Diagnostics: Advanced imaging software that can assist radiologists in detecting early signs of disease.\n\nPatient Portal Enhancement: A mobile-friendly patient portal that provides easy access to medical records, appointment scheduling, and prescription refills.\n\n"Technology should enhance, not complicate, the patient experience," said Dr. Jennifer Martinez, Chief Medical Officer. "This initiative puts patients at the center of everything we do."\n\nThe implementation will be phased over 18 months, beginning with the EHR upgrade in March. Training programs for medical staff are already underway, with over 200 healthcare professionals participating in technology workshops.\n\nPatient feedback has been overwhelmingly positive during the pilot phase. "The new system makes it so much easier to manage my health," said patient Robert Kim. "I can see my test results immediately and communicate with my doctor without scheduling an appointment."\n\nThe healthcare system expects the technology improvements to reduce patient wait times by 25% and improve diagnostic accuracy by 15%. The initiative is funded through a combination of federal grants, private donations, and operational savings.',
        images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&crop=center'],
        createdAt: new Date('2024-01-12'),
        status: 'published',
        author: 'Dr. Emily Watson',
        category: 'Healthcare',
        readTime: 4
      },
      {
        id: '5',
        title: 'Education Department Launches Digital Learning Platform',
        content: 'The local education department has launched a new digital learning platform designed to enhance student engagement and provide personalized learning experiences. The initiative represents a significant investment in educational technology.\n\nThe platform, called "EduConnect," provides students with access to interactive lessons, virtual laboratories, and collaborative learning tools. Teachers can customize content to meet individual student needs and track progress in real-time.\n\n"This platform represents the future of education," said Superintendent Dr. Lisa Thompson. "It allows us to provide personalized learning experiences that adapt to each student\'s unique needs and learning style."\n\nKey features of EduConnect include:\n\nAdaptive Learning: The platform uses artificial intelligence to adjust difficulty levels based on student performance.\n\nVirtual Reality Labs: Students can conduct science experiments in virtual environments that would be impossible or dangerous in traditional classrooms.\n\nCollaborative Tools: Students can work together on projects using built-in communication and file-sharing features.\n\nParent Dashboard: Parents can monitor their child\'s progress and communicate directly with teachers.\n\nTeacher Analytics: Educators receive detailed insights into student performance and can identify areas where additional support is needed.\n\nThe platform has been piloted in five schools over the past six months, with overwhelmingly positive results. Students showed a 23% improvement in test scores, and teachers reported increased engagement and participation.\n\n"EduConnect has transformed how I teach," said middle school science teacher Mark Johnson. "I can now provide individualized attention to every student while maintaining high academic standards."\n\nThe $3.2 million initiative is funded through federal education grants and local school district funds. All 45 schools in the district will have access to the platform by the end of the academic year.\n\nStudents and parents can access EduConnect through any internet-connected device, ensuring learning can continue beyond the classroom. The platform includes robust security measures to protect student privacy and data.',
        images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center'],
        createdAt: new Date('2024-01-11'),
        status: 'published',
        author: 'Lisa Thompson',
        category: 'Education',
        readTime: 3
      }
    ];

    setAllArticles(sampleArticles);
    
    const articleId = params.id as string;
    const foundArticle = sampleArticles.find(a => a.id === articleId);
    if (foundArticle) {
      // Stop any current speech when changing articles
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
      }
      
      setArticle(foundArticle);
      setCurrentIndex(sampleArticles.findIndex(a => a.id === articleId));
    }
  }, [params.id]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const navigateToArticle = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1;
    } else {
      newIndex = currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextArticle = allArticles[newIndex];
    router.push(`/article/${nextArticle.id}`);
  };

  const speakText = (text: string) => {
    if (!speechSupported || !article) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower than normal
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Alex')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceRead = () => {
    if (!article) return;

    if (isPlaying) {
      if (isPaused) {
        pauseSpeech();
      } else {
        pauseSpeech();
      }
    } else {
      const textToSpeak = `${article.title}. ${article.content}`;
      speakText(textToSpeak);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="headline-serif text-4xl md:text-5xl font-bold text-black mb-2">
              GWBN
            </Link>
            <div className="text-right">
              <p className="caption-text text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="caption-text text-xs">
                Vol. 1, No. 1
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="caption-text">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="caption-text uppercase text-xs font-semibold text-accent">
                {article.category}
              </span>
              <span className="caption-text">•</span>
              <span className="caption-text">{getTimeAgo(article.createdAt)}</span>
            </div>
            
            <h1 className="headline-serif text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.images && article.images.length > 0 && (
            <div className="mb-8">
              <div className="bg-gray-100 aspect-[16/9] mb-4 rounded-lg overflow-hidden">
                <Image
                  src={article.images[0]}
                  alt={article.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <p className="caption-text text-xs text-gray-600">
                Photo: {article.author} / Golden West Business News
              </p>
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div className="body-text text-lg leading-relaxed text-gray-800 whitespace-pre-line">
              {article.content}
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  <span className="caption-text">Share</span>
                </button>
                <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                  <EyeIcon className="w-4 h-4" />
                  <span className="caption-text">Save</span>
                </button>
                {speechSupported && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleVoiceRead}
                      className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
                    >
                      {isPlaying ? (
                        isPaused ? (
                          <PlayIcon className="w-4 h-4" />
                        ) : (
                          <PauseIcon className="w-4 h-4" />
                        )
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                      <span className="caption-text">
                        {isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
                      </span>
                    </button>
                    {isPlaying && (
                      <button 
                        onClick={stopSpeech}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <StopIcon className="w-4 h-4" />
                        <span className="caption-text">Stop</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="caption-text text-xs">
                  Published by Golden West Business News
                </p>
                <p className="caption-text text-xs">
                  © 2024 All rights reserved
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Navigation to Other Articles */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Article */}
            <button
              onClick={() => navigateToArticle('prev')}
              className="group flex items-start gap-4 p-4 border border-gray-300 hover:border-black transition-colors text-left"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.images[0] || ''}
                    alt={allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.title || ''}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
                  <p className="caption-text text-xs text-gray-500">Previous Article</p>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors leading-tight">
                  {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.author} • {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.readTime} min read
                </p>
              </div>
            </button>

            {/* Next Article */}
            <button
              onClick={() => navigateToArticle('next')}
              className="group flex items-start gap-4 p-4 border border-gray-300 hover:border-black transition-colors text-left"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.images[0] || ''}
                    alt={allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.title || ''}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="caption-text text-xs text-gray-500">Next Article</p>
                  <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors leading-tight">
                  {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.author} • {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.readTime} min read
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="caption-text text-xs">
              © 2024 Golden West Business News. All rights reserved. Built with Next.js, TypeScript, and AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
