import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for articles (in production, this would be a database)
let articles: Array<{
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  status: 'draft' | 'published';
  author?: string;
  category?: string;
  readTime?: number;
}> = [
  // Sample published articles
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

// GET /api/articles - Get all published articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let filteredArticles = articles;
    
    // Filter by status if provided
    if (status) {
      filteredArticles = articles.filter(article => article.status === status);
    }
    
    // Sort by creation date (newest first)
    filteredArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      count: filteredArticles.length
    });
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, images = [], author, category = 'Business' } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const newArticle = {
      id: Date.now().toString(),
      title,
      content,
      images,
      createdAt: new Date(),
      status: 'published' as const,
      author: author || 'Staff Reporter',
      category,
      readTime
    };
    
    // Add to the beginning of the array (newest first)
    articles.unshift(newArticle);
    
    return NextResponse.json({
      success: true,
      article: newArticle
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
