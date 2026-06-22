
export async function searchApi(userInput){
    const url = "https://openrouter.ai/api/v1/chat/completions";
    
    const SYSTEM_PROMPT = `
    You convert file search requests into JSON.

    Return ONLY valid JSON.
    No explanations. No markdown.

    Use this schema:
    {drive:null,folder:null,includeFileTypes:[],excludeFileTypes:[],createdFrom:null,createdTo:null,modifiedFrom:null,modifiedTo:null,minSizeMB:null,maxSizeMB:null,filenameKeywords:[],contentKeywords:[],sortBy:null,sortOrder:null,limit:null}

    Rules:
    - file extensions → includeFileTypes
    - "not X" → excludeFileTypes
    - names → filenameKeywords
    - topics → contentKeywords
    - "last/this month/year" → createdFrom/createdTo
    - "bigger than XGB" → minSizeMB (MB converted)
    - "top 10" → limit=10
    - "sort by name" → sortBy="name"
    - "sort by size" → sortBy="size"
    - "sort by date created" → sortBy="created"
    - "sort by date modified" → sortBy="modified"
    - "ascending" → sortOrder="asc"
    - "descending" → sortOrder="desc"
    `;


    try{
        const response = await fetch(url,
            {
                method : "POST",
                headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
                }, 
                body : JSON.stringify({
                model: "google/gemma-4-31b-it:free",
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                temperature: 0,
                max_tokens: 150
            })
            }
        )
        const data = await response.json();

        if(data.error){
            throw new Error(data.error.messages);
        }
        let content = data.choices[0].message.content;

        content = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(content);
        
    }
    catch(error){
        console.error("Open router error :",error);
        return null;
        
    }
}

