import * as fs from "node:fs/promises"
import path from "node:path"
import os, { homedir } from "node:os"
import pdf from "pdf-parse";

const searchQuerySchema = {
        drive: null,
        folder: null,
        includeFileTypes: [],
        excludeFileTypes: [],
        createdFrom: null,
        createdTo: null,
        modifiedFrom: null,
        modifiedTo: null,
        minSizeMB: null,
        maxSizeMB: null,
        filenameKeywords: [],
        contentKeywords: [],
        sortBy: null,
        sortOrder: null,
        limit: null
    };

export async function searchFiles(filters){ //"filters" is the json return by the AI api.
    const query = {
        ...searchQuerySchema,  //The spread operator is used here to merge the filters and the schema into a single variable.
        ...filters
    }


    const normalizeFilter = (data) => { // Used to ensure the json format is correct.
        const cleaned = {... data}

        //Numbers fix
        if(cleaned.minSizeMB !== null && cleaned.minSizeMB !== undefined){ //minSizeMB
            cleaned.minSizeMB = Number(cleaned.minSizeMB);
            if(Number.isNaN(cleaned.minSizeMB)) cleaned.minSizeMB = null;
        }
        if(cleaned.maxSizeMB !== null && cleaned.maxSizeMB !== undefined){ //maxnSizeMB
            cleaned.maxSizeMB = Number(cleaned.maxSizeMB);
            if(Number.isNaN(cleaned.maxSizeMB)) cleaned.maxSizeMB = null;
        }
        if(cleaned.limit !== null && cleaned.limit !== undefined){ //limit
            cleaned.limit = Number(cleaned.limit);
            if(Number.isNaN(cleaned.limit)) cleaned.limit = null;
        }

        //Date fix
        if(cleaned.createdFrom !== null && cleaned.createdFrom !== undefined){
            const date = new Date(cleaned.createdFrom);
            
            if(Number.isNaN(date.getTime())){
                cleaned.createdFrom = null
            }else{
                cleaned.createdFrom = date;
            }
        }

        if(cleaned.createdTo !== null && cleaned.createdTo !== undefined){
            const date = new Date(cleaned.createdTo);
            
            if(Number.isNaN(date.getTime())){
                cleaned.createdTo = null
            }else{
                cleaned.createdTo = date;
            }
        }
        if(cleaned.modifiedFrom !== null && cleaned.modifiedFrom !== undefined){
            const date = new Date(cleaned.modifiedFrom);
            
            if(Number.isNaN(date.getTime())){
                cleaned.modifiedFrom = null
            }else{
                cleaned.modifiedFrom = date;
            }
        }
        if(cleaned.modifiedTo !== null && cleaned.modifiedTo !== undefined){
            const date = new Date(cleaned.modifiedTo);
            
            if(Number.isNaN(date.getTime())){
                cleaned.modifiedTo = null
            }else{
                cleaned.modifiedTo = date;
            }
        }

        //Arrays
        if(!Array.isArray(cleaned.includeFileTypes)){
            cleaned.includeFileTypes = cleaned.includeFileTypes ? [cleaned.includeFileTypes] : [];
        }

        if(!Array.isArray(cleaned.excludeFileTypes)){
            cleaned.excludeFileTypes = cleaned.excludeFileTypes ? [cleaned.excludeFileTypes] : [];
        }

        if(!Array.isArray(cleaned.filenameKeywords)){
            cleaned.filenameKeywords = cleaned.filenameKeywords ? [cleaned.filenameKeywords] : [];
        }
        if(!Array.isArray(cleaned.contentKeywords)){
            cleaned.contentKeywords = cleaned.contentKeywords ? [cleaned.contentKeywords] : [];
        }

        //Fix the file types
        cleaned.includeFileTypes = cleaned.includeFileTypes.map(ext => 
            ext.startsWith(".") ? ext : "." + ext
        );
        cleaned.excludeFileTypes = cleaned.excludeFileTypes.map(ext => 
            ext.startsWith(".") ? ext : "." + ext
        );

        //Just format the drive letter
        if(cleaned.drive && typeof cleaned.drive === "string"){
            cleaned.drive = cleaned.drive.toUpperCase();

            if(!cleaned.drive.endsWith(':'))
                cleaned.drive += ':';
        }
        return cleaned;
    }


    const getSearchRoot = (query) => {//For the starting of search
        const home = os.homedir()
        if(query.drive && query.folder){
            return path.join(query.drive,query.folder);
        }
        if(query.drive){
            return query.drive + "\\"
        }

        if(query.folder) {
            return path.join(home,query.folder);
        }
        return home;
    }

    const matchesFileType = (filename,query) => {   //This function is to returns a boolean based on the includeFileTypes,excludeFileTypes arrays.
        const binaryExtensions = [".grp", ".exe", ".dll", ".bin", ".dat", ".pak"];
        const extension = path.extname(filename).toLowerCase();

        if(binaryExtensions.includes(extension)) return false;

        if(query.includeFileTypes.length > 0  &&  !query.includeFileTypes.includes(extension))
            return false;

        if(query.excludeFileTypes.includes(extension))
            return false;

        return true;
        
    }
    const matchesFileName = (filename,query) => {
        if(query.filenameKeywords.length === 0 || query.filenameKeywords[0] === "") return true;

        const nameWithoutExtension = path.basename(filename,path.extname(filename)).toLowerCase();
        for(const name of query.filenameKeywords){
            if(nameWithoutExtension.includes(name.toLowerCase()))
                return true;
        }
        return false;        
    }

    const getPdfText = async (filePath) => {
        try {
            const buffer = await fs.readFile(filePath);
            const data = await pdf(buffer);

            return data.text || "";
        } catch (err) {
            console.log("PDF parser failed:", filePath, err.message);
            return "";
        }
    };


    const matchesContent = async (filePath,query) => { // Returns true only if ALL keywords in the query exist in the file content.
        if(query.contentKeywords.length === 0 || !query.contentKeywords || query.contentKeywords[0] === "") return true;
        try{
            const ext = path.extname(filePath).toLowerCase();

            let text = "";

            if (ext === ".pdf") {//Just for the PDF only
                text = await getPdfText(filePath);

                if(!text) return false;
            }

            else { // Other files such as .txt, .c, .js, .java, etc.... go here. These are compatible with UTF-8 encoding.
                try {
                    text = await fs.readFile(filePath, "utf-8");
                } catch {
                    return false; 
                }
            }

            text = text.toLowerCase();

            for (const keyWord of query.contentKeywords) {
                if (!text.includes(keyWord.toLowerCase())) {
                    return false;
                }
            }

            return true;
        }
        catch(err){
            return false;
            console.error(err);
        }
    }

    const matchesFileSize = (stats,query) => {
        const fileSizeMB = stats.size / (1024 * 1024);

        if(query.minSizeMB !== null){
            if(fileSizeMB < query.minSizeMB) return false;
        }
        if(query.maxSizeMB !== null){
            if(fileSizeMB > query.maxSizeMB) return false;
        }
        return true;
    }
    const matchesCreatedDate = (stats,query) => {
        const fileCreatedDate = stats.birthtime;

        if(query.createdFrom !== null){
            if(fileCreatedDate < query.createdFrom) return false;
        }
        if(query.createdTo !== null){
            if(fileCreatedDate > query.createdTo) return false;
        }
        return true;
    }

    const matchesModifiedDate = (stats,query) => {
        const fileModifiedDate = stats.mtime;

        if(query.modifiedFrom !== null){
            if(fileModifiedDate < query.modifiedFrom) return false;
        }
        if(query.modifiedTo !== null){
            if(fileModifiedDate > query.modifiedTo) return false;
        }
        return true;
    }
    

    const scanDirectory = async (dirPath,query,results = []) =>{ // The main function to search File in a recursive method

        console.log("Scanning:", dirPath);

        const EXCLUDED_FOLDERS = [
            // Windows
            "Windows",
            "Program Files",
            "Program Files (x86)",
            "ProgramData",
            "$Recycle.Bin",
            "System Volume Information",
            "AppData",
            "steam",
            "steamapps",
            "SteamLibrary",

            "node_modules",
            ".git",
            ".vs",
            ".vscode",

            "npm-cache",
            ".npm",
            ".cache",

            "__pycache__",
            ".venv",
            "venv",
            "dist",
            "build",
            "out",

            ".idea",

            "Temp",
            "tmp",
            "VirtualBox VMs",
            ".gradle",
            "target"
        ];

        try {
            const items = await fs.readdir(dirPath,{withFileTypes : true});
    
            for(const item of items){
    
                const fullPath = path.join(dirPath,item.name);
                if(item.isDirectory() && EXCLUDED_FOLDERS.includes(item.name)){
                    console.log("Excluded folders : ",item.name);
                    continue;
                }
                if(item.isDirectory()){
                    console.log("Directory:", fullPath);
                    await scanDirectory(fullPath,query,results);
                    continue;
                }
                if(item.isFile()){
                    console.log("File Found:", fullPath);
                    let stats;

                    try {
                        stats = await fs.stat(fullPath);
                    } 

                    catch (error) {
                        continue;
                    }
    
                    if(!matchesFileType(item.name,query)){
                        console.log("Type failed",item.name);
                        continue;
                    }
    
                    if(!matchesFileName(item.name,query)){
                        console.log("Name failed",item.name);
                        continue;
                    }
                    console.log("Name passed",item.name);

                    if(!matchesFileSize(stats,query)){
                        console.log("Size failed",item.name);
                        continue;
                    }
                    console.log("Size passed",item.name);

    
                    if(!matchesCreatedDate(stats,query)){
                        console.log("Creation date failed",item.name);
                        continue;
                    }
                    console.log("Creation date passed",item.name);
    
                    if(!matchesModifiedDate(stats,query)){
                        console.log("modified date failed",item.name);
                        continue;
                    }
                    console.log("modified date passed",item.name);
    
                    if(!(await matchesContent(fullPath,query))){
                        console.log("Content match failed",item.name);
                        continue;
                    }
                    console.log("Content match Passed",item.name);
    
                    results.push({
                        name : item.name,
                        path : fullPath,
                        size : stats.size,
                        created : stats.birthtime,
                        modified : stats.mtime
                    })
                    
                }
            }
        } catch (error){
            console.log("Skipped...Something goes wrong, May be no permission",dirPath);
            console.log("Reason of the catch block : ",error);
            
            
        }
        return results;
    }

    const sortResults = (results,query) => {
        if(!query.sortBy) return results;

        const order = query.sortOrder === 'desc' ? -1 : 1;

        return results.sort((a,b) => {
            switch (query.sortBy){

                case 'name':
                    return a.name.toLowerCase()
                    .localeCompare(b.name.toLowerCase()) * order;
                case 'size':
                    return (a.size - b.size) * order;
                case 'created' :
                    return (a.created - b.created) * order;
                case 'modified':
                    return (a.modified - b.modified) * order;
                default:
                    return 0;
            }
        });
    };

    const applyLimites = (results,query) => {
        if(query.limit === null)
            return results;
        return results.slice(0,query.limit);
    }
    const normalizedQuery = normalizeFilter(filters);

    const searchRoot = getSearchRoot(normalizedQuery);

    console.log("The rooot : ",searchRoot);

    let results = await scanDirectory(searchRoot, normalizedQuery);

    if(results.length === 0){
        if (normalizedQuery.drive) {
            return results;
        }

        const fallbackDrives = ["D:", "E:"];

        for(const drive of fallbackDrives){

            try{

                console.log("Trying drive:", drive);

                results = await scanDirectory(
                    drive + "\\",
                    normalizedQuery,
                    []
                );

                if(results.length > 0){
                    console.log("Found results in:", drive);
                    break;
                }

            }
            catch(err){
                continue;
            }
        }
    }

    const sortedResults = sortResults(results, normalizedQuery);

    const finalResults = applyLimites(sortedResults, normalizedQuery);

    return finalResults;
}

//searchFiles(); //for test








//For test
const query = {
    drive :"E",
    includeFileTypes: [".pdf"],
    excludeFileTypes: [],
    filenameKeywords: [],
    contentKeywords: ["PECST525"],

    createdFrom: null,
    createdTo: null,

    modifiedFrom: null,
    modifiedTo: null,

    minSizeMB: null,
    maxSizeMB: null,

    sortBy: "name",
    sortOrder: "asc",

};
console.time("Search");
const results = await searchFiles(query);
console.timeEnd("Search");

console.log("Results Found:", results.length);
console.log(results);