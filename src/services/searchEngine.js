import * as fs from "node:fs/promises"
import path from "node:path"
import os, { homedir } from "node:os"
import { ReceiptRussianRuble } from "lucide-react";

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


    const getSearchRoots = (query) => {//Ffor the starting
        const home = os.homedir
        if(query.drive && query.folder){
            return path.join(query.drive,query.folder);
        }
        if(query.drive){
            return query.drive + "\\"
        }

        if(query.folder) {
            return path.join(home,folder);
        }

        return home;
    }
    
}