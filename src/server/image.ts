'use server'
import axios from 'axios'

import prisma from "@/lib/db"

export async function saveImageForUser(url : string, userId  : string){
    const image = await prisma.images.create({
        data:{
            url,
            userId
        }
    })

    return image;
}

export async function fetchUserImages(userId : string){
    const images = await prisma.images.findMany({
        where: {
            userId 
        },
        select : {
            url : true
        }
    })

    return images.map((image)=>image.url)
}

export async function deleteImage(url : string, userId  : string){
    const image = await prisma.images.findUnique({
        where : {
            userId,
            url,   
        }
    })

    if(!image) throw new Error("Invalid user id")

    await prisma.images.delete({
        where : {
            url,
            userId,   
        }
        
    })

    await axios.delete(`${process.env.PUBLIC_URL}/api/uploadthing`, {
        data: {
          url,
        },
      });
}