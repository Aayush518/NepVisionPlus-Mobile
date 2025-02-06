// Parse the dictionary data from current.txt content
const rawDictionary = `जनताको JH AH0 N T AA1 K OW0
अधिकार AH0 DH IH0 K AA1 R
र R AH0
स्वतन्त्रता S W AH0 T AH1 N T R AH0 T AA0
सुनिश्चित S UH0 N IH1 SH CH IH0 T
गर्नका G AH1 R N AH0 K AA0
लागि L AA1 G IH0
प्रभावकारी P R AH0 B HH AA1 V K AA0 R IY0
कानुनी K AA0 N UH1 N IY0
संरचनाहरूको S AH0 M R AH0 CH AH1 N AA0 HH AH0 R UW0 K OW0
विकास V IH0 K AA1 S`;

// Convert raw dictionary text to key-value pairs
export const dictionaryData: { [key: string]: string } = rawDictionary
  .split('\n')
  .reduce((acc: { [key: string]: string }, line: string) => {
    const [word, ...arpabetParts] = line.split(' ');
    if (word && arpabetParts.length > 0) {
      acc[word.trim()] = arpabetParts.join(' ').trim();
    }
    return acc;
  }, {});