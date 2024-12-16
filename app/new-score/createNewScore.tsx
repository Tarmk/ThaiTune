import React, { useEffect } from 'react';
import axios from 'axios';

const CreateNewScorePage2 = () => {
  useEffect(() => {
    const createScore = async () => {
      try {
        const response = await axios({
          method: 'post',
          url: 'https://api.flat.io/v2/scores',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': '069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c'
          },
          data: {
            title: "Piano and Voice2",
            builderData: {
              scoreData: {
                instruments: [
                  {
                    group: "keyboards",
                    instrument: "piano"
                  }
                ]
              }
            },
            privacy: "public"
          }
        });
        console.log('Score created:', response.data);
      } catch (error) {
        console.error('Error creating score:', error);
      }
    };

    // createScore();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Score Page 2</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Add your form or content here */}
        <p>Add your score creation content here</p>
        <iframe src="https://flat.io/embed/67580d42a87b63dd1b4fb8dd?mode=edit&appId=675579130b7f5c8a374ac19a" height="450" width="100%" frameBorder="0" allowFullScreen allow="autoplay; midi"></iframe>
      </div>
    </div>
  );
};

export default CreateNewScorePage2;
