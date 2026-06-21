import * as fs from "node:fs/promises"
import path from "node:path"
import os, { homedir } from "node:os"

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
        const extension = path.extname(filename).toLowerCase();

        if(query.includeFileTypes.length > 0  &&  !query.includeFileTypes.includes(extension))
            return false;

        if(query.excludeFileTypes.includes(extension))
            return false;

        return true;
        
    }
    const matchesFileName = (filename,query) => {
        if(query.filenameKeywords.length === 0) return true;

        const nameWithoutExtension = path.basename(filename,path.extname(filename)).toLowerCase();
        for(const name of query.filenameKeywords){
            if(nameWithoutExtension.includes(name.toLowerCase()))
                return true;
        }
        return false;        
    }
    const matchesContent = async (filePath,query) => {
        if(query.contentKeywords.length === 0) return true;
        try{
            const content = await fs.readFile(filePath,"utf-8");
            const text = content.toLowerCase();
            // console.log(query.contentKeywords);
            // console.log(text);
            
            for(const keyWord of query.contentKeywords){
                if(!text.includes(keyWord))
                    return false;
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

        const EXCLUDED_FOLDERS = [
        "Windows",
        "Program Files",
        "Program Files (x86)",
        "ProgramData",
        "$Recycle.Bin",
        "System Volume Information",
        "node_modules",
        ".git"
        ];

        try {
            const items = await fs.readdir(dirPath,{withFileTypes : true});
    
            for(const item of items){
    
                const fullPath = path.join(dirPath,item.name);
                if(item.isDirectory() && EXCLUDED_FOLDERS.includes(item.name)){
                    console.log("Excluded folders .. skip it ..");
                    continue;
                }
                if(item.isDirectory()){
                    await scanDirectory(fullPath,query,results);
                    continue;
                }
                if(item.isFile()){
                    let stats;

                    try {
                        stats = await fs.stat(fullPath);
                    } 

                    catch (error) {
                        continue;
                    }
    
                    if(!matchesFileType(item.name,query))
                        continue;
    
                    if(!matchesFileName(item.name,query))
                        continue;
    
                    if(!matchesFileSize(stats,query))
                        continue;
    
                    if(!matchesCreatedDate(stats,query))
                        continue;
    
                    if(!matchesModifiedDate(stats,query))
                        continue;
    
                    if(!(await matchesContent(fullPath,query)))
                        continue;
    
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
            
        }
        return results;
    }


}
//searchFiles(); //for test