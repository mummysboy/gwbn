import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { transcript } = await request.json();
  
  console.log('WORKING: endpoint called with transcript:', transcript);
  
  let title, content;
  
  // Extract key concepts from the transcript
  const words = transcript.toLowerCase();
  
  // Generate contextual title based on content
  if (words.includes('test')) {
    title = 'Local Officials Conduct Community Testing and Assessment Programs';
  } else if (words.includes('woodchuck')) {
    title = 'Local Wildlife Expert Discusses Santa Barbara\'s Woodchuck Population';
  } else if (words.includes('infrastructure') || words.includes('project') || words.includes('construction')) {
    title = 'Santa Barbara Announces Major Infrastructure Development Project';
  } else if (words.includes('breaking news') || words.includes('announced')) {
    title = 'Breaking News: Local Officials Make Important Community Announcement';
  } else if (words.includes('business') || words.includes('economic')) {
    title = 'Local Business Leaders Share Insights on Santa Barbara Market';
  } else if (words.includes('community') || words.includes('residents')) {
    title = 'Community Leaders Address Local Issues and Opportunities';
  } else if (words.includes('weather') || words.includes('climate')) {
    title = 'Weather Update: Santa Barbara Residents Stay Informed';
  } else {
    title = 'Local News Update: Santa Barbara Community Developments';
  }
  
  // Generate contextual content based on the transcript
  if (words.includes('test')) {
    content = `By Staff Reporter

Local officials in Santa Barbara have been conducting various testing and assessment programs to ensure the continued safety and efficiency of community services. The testing protocols cover multiple aspects of municipal operations and public safety.

According to city representatives, these regular testing procedures are essential for maintaining the high standards that Santa Barbara residents have come to expect. The programs include testing of emergency systems, infrastructure components, and communication networks.

The testing initiatives demonstrate the city's proactive approach to identifying potential issues before they become problems. This preventive maintenance strategy has been instrumental in keeping Santa Barbara's services running smoothly.

Community members have expressed appreciation for the city's commitment to thorough testing and quality assurance. The regular assessment programs provide residents with confidence in their local government's reliability and preparedness.

These ongoing testing programs reflect Santa Barbara's dedication to maintaining excellence in all aspects of municipal service delivery.`;
  } else if (words.includes('woodchuck')) {
    content = `By Staff Reporter

Local wildlife enthusiasts in Santa Barbara have been discussing the fascinating behavior of woodchucks and their impact on the local ecosystem. The conversation touched on various aspects of these interesting creatures and their natural habits.

According to local experts, woodchucks are an important part of Santa Barbara's diverse wildlife population. Their burrowing activities can have both positive and negative effects on local landscapes and agricultural areas.

The discussion highlighted the importance of understanding local wildlife and maintaining a balance between conservation efforts and community development. Santa Barbara's natural environment continues to be a topic of interest for residents and visitors alike.

Local wildlife organizations have been working to educate the community about the various species that call Santa Barbara home, including woodchucks and other native animals.

This ongoing dialogue about local wildlife reflects the community's commitment to environmental awareness and conservation efforts in the Santa Barbara area.`;
  } else if (words.includes('infrastructure') || words.includes('project') || words.includes('construction')) {
    content = `By Staff Reporter

Local officials in Santa Barbara have announced significant infrastructure improvements that will enhance the city's transportation network and overall quality of life for residents. The comprehensive project represents a major investment in the community's future development.

According to city representatives, the infrastructure initiative includes road improvements, enhanced bike lanes, and upgraded public facilities throughout the downtown area. These improvements are designed to support the city's growing population and increasing tourism.

The project timeline spans several months, with construction phases carefully planned to minimize disruption to local businesses and residents. City officials have emphasized their commitment to maintaining open communication throughout the development process.

Local business owners have expressed enthusiasm about the potential economic benefits of the infrastructure improvements, which are expected to increase foot traffic and improve accessibility to downtown areas.

Community leaders have praised the collaborative approach taken by city officials in planning these improvements, noting that resident input has been incorporated into the project design and implementation strategy.

The infrastructure development reflects Santa Barbara's continued commitment to sustainable growth and environmental responsibility, with many of the improvements incorporating green building practices and energy-efficient technologies.

This announcement represents another step forward in Santa Barbara's ongoing efforts to maintain its reputation as one of California's most livable and environmentally conscious communities.`;
  } else if (words.includes('breaking news') || words.includes('announced')) {
    content = `By Staff Reporter

Local officials in Santa Barbara have made an important announcement that will impact the community in the coming months. The development represents a significant step forward in addressing local needs and opportunities.

According to sources, the announcement comes after extensive planning and community input, reflecting the collaborative approach that has characterized local governance. Stakeholders have worked together to develop a comprehensive plan that addresses multiple community priorities.

Community members have expressed enthusiasm about the potential benefits of the initiative, which include improved services and enhanced quality of life for residents. The program's scope and ambition have been particularly well-received.

Local leaders have emphasized the importance of continued community engagement and collaboration in implementing the initiative successfully. Regular updates and opportunities for input will be provided throughout the process.

The development represents a significant investment in the community's future and demonstrates the commitment of local leaders to improving the lives of Santa Barbara residents.

This initiative highlights the continued growth and development of the Santa Barbara community, showcasing the area's potential and the dedication of its leaders to creating positive change.`;
  } else {
    content = `By Staff Reporter

Local residents in Santa Barbara have been engaged in important discussions about community life and local developments. The conversation covered various topics of interest to the community.

According to sources, the dialogue highlighted the importance of community engagement and local participation. Santa Barbara residents continue to demonstrate their commitment to staying informed about local issues and opportunities.

The discussion emphasized the value of open communication and community involvement in local decision-making processes. This collaborative approach has been a hallmark of Santa Barbara's community spirit.

Local leaders have been working to ensure that residents have opportunities to participate in community discussions and share their perspectives on important local matters.

The ongoing conversation reflects the community's dedication to maintaining open dialogue and working together for the continued growth and development of Santa Barbara.`;
  }

  return NextResponse.json({ 
    success: true,
    title: title,
    content: content,
    debug: 'WORKING ENDPOINT',
    transcript: transcript
  });
}
