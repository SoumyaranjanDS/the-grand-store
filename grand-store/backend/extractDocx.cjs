const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({path: "c:\\Users\\soumy\\OneDrive\\Desktop\\HTML\\internship\\project-15-grandstore\\GRAND STORE AUCTION FEATURES.docx"})
    .then(function(result){
        const text = result.value; // The raw text
        fs.writeFileSync('c:\\Users\\soumy\\.gemini\\antigravity-ide\\brain\\b9d26ede-2dc4-4e5d-ae64-02062d87ea32\\scratch\\auction_features.txt', text);
        console.log("Extracted!");
    })
    .catch(function(error) {
        console.error(error);
    });
