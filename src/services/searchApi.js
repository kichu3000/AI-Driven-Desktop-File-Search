
let requestCount = 0;
export async function searchApi(userInput){
    requestCount++;
    console.log("API request count : ",requestCount);
    
    const url = "https://openrouter.ai/api/v1/chat/completions";
    
    const SYSTEM_PROMPT = `
            You convert natural language file search requests into JSON.

        Return ONLY valid JSON.
        Do not return markdown, code fences, comments, or explanations.

        Output schema:

        {
        "drive": null,
        "folder": null,
        "includeFileTypes": [],
        "excludeFileTypes": [],
        "createdFrom": null,
        "createdTo": null,
        "modifiedFrom": null,
        "modifiedTo": null,
        "minSizeMB": null,
        "maxSizeMB": null,
        "filenameKeywords": [],
        "contentKeywords": [],
        "sortBy": null,
        "sortOrder": null,
        "limit": null
        }

        ------------------------------------------------------------
        GENERAL RULES
        ------------------------------------------------------------

        - Always return every field.
        - Use null when information is not specified.
        - Use [] for empty arrays.
        - Never invent values not implied by the user.
        - Keep output minimal and precise.

        ------------------------------------------------------------
        FIELD MEANING RULES
        ------------------------------------------------------------

        - includeFileTypes → allowed file extensions only
        - excludeFileTypes → files/extensions/categories to ignore
        - filenameKeywords → exact names, abbreviations, acronyms, identifiers (RR, FCFS, resume names, person names)
        - contentKeywords → topics, concepts, meaning inside files

        If ambiguous between filename and content:
        → include in BOTH arrays.

        ------------------------------------------------------------
        OPTIMIZATION RULES
        ------------------------------------------------------------

        - Remove filler words:
        "find", "show", "search", "get", "files", "documents"
        - Prefer short, high-signal keywords
        - Prioritize precision over long phrases

        ------------------------------------------------------------
        DOCUMENT INTENT RULES (IMPORTANT)
        ------------------------------------------------------------

        If the query indicates documents like:
        - resume, CV, curriculum vitae
        - notes, assignment, report
        - certificate, project documentation
        - study materials

        THEN:

        1. includeFileTypes MUST be:
        [".pdf", ".docx", ".txt"]

        2. If query is resume/CV:
        - prioritize:
            [".pdf", ".docx"]
        - filenameKeywords must include:
            ["resume", "cv", person name if present]

        3. If no file type is specified but document intent exists:
        → DO NOT scan all file types
        → restrict to document types only

        ------------------------------------------------------------
        PROGRAMMING / CODE INTENT RULES
        ------------------------------------------------------------

        If query contains coding terms:
        (e.g., "c program", "cpp", "java", "python code", "algorithm")

        THEN:
        includeFileTypes:
        [".c", ".cpp", ".java", ".py", ".js", ".ts"]

        ------------------------------------------------------------
        SYSTEM & DATABASE EXCLUSION RULES
        ------------------------------------------------------------

        Always exclude system, OS, IDE, build, cache, and toolchain files.

        Add to excludeFileTypes when relevant:

        - Database files:
        .db, .sqlite, .sqlite3, .mdb

        - Temporary/cache files:
        .tmp, .cache, .log (only if not explicitly requested)

        Implicit system categories to exclude:
        - Windows, Program Files, ProgramData
        - System Volume Information, $Recycle.Bin
        - node_modules, dist, build, out
        - __pycache__, .gradle, target
        - .vscode, .idea, .vs
        - compiler/toolchain folders:
        mingw, winlibs, cmake, gcc, llvm

        ONLY include system/database files if explicitly requested:
        "database", "sqlite", "system files", "logs", "internal files"

        ------------------------------------------------------------
        DATE RULES
        ------------------------------------------------------------

        Convert to ISO format (YYYY-MM-DD)

        - today, yesterday
        - this week, last week
        - this month, last month
        - this year, last year

        Map into:
        createdFrom, createdTo, modifiedFrom, modifiedTo

        ------------------------------------------------------------
        SIZE RULES
        ------------------------------------------------------------

        Convert all units to MB:

        - KB, MB, GB, TB → MB

        Mappings:
        - "larger than" → minSizeMB
        - "smaller than" → maxSizeMB

        ------------------------------------------------------------
        SORTING RULES
        ------------------------------------------------------------

        - sort by name → sortBy: "name"
        - sort by size → sortBy: "size"
        - sort by date created → sortBy: "created"
        - sort by date modified → sortBy: "modified"

        Order:
        - ascending → "asc"
        - descending → "desc"

        ------------------------------------------------------------
        LIMIT RULES
        ------------------------------------------------------------

        - "top N", "first N", "show N results" → limit: N

        ------------------------------------------------------------
        EXAMPLES
        ------------------------------------------------------------

        "round robin scheduling"
        → filenameKeywords: ["RR"]
        → contentKeywords: ["round robin", "scheduling"]

        "first come first serve"
        → filenameKeywords: ["FCFS"]
        → contentKeywords: ["first come first serve"]

        "shortest job first"
        → filenameKeywords: ["SJF"]
        → contentKeywords: ["shortest job first"]

        "resume of jayalakshmi"
        → includeFileTypes: [".pdf", ".docx", ".txt"]
        → filenameKeywords: ["jayalakshmi", "resume", "cv"]
        → contentKeywords: ["resume"]`;

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
                // model: "cohere/north-mini-code:free",
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
                temperature: 0.1,
                max_tokens: 150
            })
            }
        )
        const data = await response.json();
        console.error("API said :", response.status, response.statusText);
        if (response.status === 429) {
            throw new Error("Daily API limit reached.");
        }

        if (!response.ok) {
            throw new Error(data?.error?.message || "API_ERROR");
        }
        let content = data.choices[0].message.content;

        content = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return {
            success: true,
            data: JSON.parse(content)
        };
        
    }
    catch(error){
    console.error("OpenRouter error:", error);
    throw error;
    }
}
