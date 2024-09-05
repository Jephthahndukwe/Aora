import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '6680212b0025a7d5f482',
    databaseId: '668022ba002f20ddc271',
    userCollectionId: '668022d700058ce8acfe',
    videoCollectionId: '668022fe001ea35b5fd9',
    storageId: '668024e4000bd7026491'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register user
export const createUser = async (email, password, username) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username
      );
  
      if (!newAccount) throw Error;
  
      const avatarUrl = avatars.getInitials(username);
  
      await signIn(email, password);
  
      const newUser = await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email,
          username,
          avatar: avatarUrl,
        }
      );
  
      return newUser;
    } catch (error) {
      throw new Error(error);
    }
  }
  

// sign In
export const signIn = async (email, password) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }


  export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
    }
  }

//   // Get Account
// export async function getAccount() {
//   try {
//     const currentAccount = await account.get();

//     return currentAccount;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

  export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
  }

  export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
  }

  export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
  }

  export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error)
    }
  }

  export const signOut = async () => {
    try {
      const session = await account.deleteSession('current');

      return session
    } catch (error) {
      throw new Error(error)
    }
  }

  export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
      if(type === 'video') {
        fileUrl = storage.getFileView(storageId, fileId)
      } else if(type === 'image') {
        fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
      } else {
        throw new Error('Invalid file type')
      }

      if(!fileUrl) throw Error;

      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
  }

  export const uploadFile = async (file, type, onProgress) => {
    if (!file) return;
  
    const { mimeType, ...rest } = file;
    const asset = {
      name: file.fileName,
      type: file.mimeType,
      size: file.fileSize,
      uri: file.uri,
    };
  
    try {
      // Simulate progress updates for the upload process
      let progress = 0;
      while (progress < 100) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        progress += 10;
        onProgress(progress);
      }
  
      const uploadedFile = await storage.createFile(
        storageId,
        ID.unique(),
        asset
      );
  
      const fileUrl = await getFilePreview(uploadedFile.$id, type);
  
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
  };
  


  export const createVideo = async (form, onProgress) => {
    const totalSteps = 2; // Two uploads: thumbnail and video
    let currentProgress = 0;
  
    const updateProgress = (progress) => {
      currentProgress += progress / totalSteps;
      onProgress(Math.min(Math.round(currentProgress), 100));
    };
  
    try {
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(form.thumbnail, 'image', progress => updateProgress(progress / totalSteps)),
        uploadFile(form.video, 'video', progress => updateProgress(progress / totalSteps)),
      ]);
  
      const newPost = await databases.createDocument(
        databaseId, 
        videoCollectionId,
        ID.unique(),
        {
          title: form.title,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          prompt: form.prompt,
          creator: form.userId,
        }
      );
  
      return newPost;
    } catch (error) {
      throw new Error(error);
    }
  };  


  const getFileIdFromUrl = (url) => {
    try {
      const urlObject = new URL(url);
      const paths = urlObject.pathname.split('/');
      return paths[paths.length - 2]; // Adjust index based on the URL structure
    } catch (error) {
      console.error('Error extracting file ID from URL:', error);
      return null;
    }
  };
  
  const checkFileExistence = async (fileId) => {
    try {
      const file = await storage.getFile(storageId, fileId);
      return !!file;
    } catch {
      return false;
    }
  };
  

  export const deleteVideo = async (videoId) => {
    try {
      // Fetch the video document to get the thumbnail and video URLs
      const videoDoc = await databases.getDocument(databaseId, videoCollectionId, videoId);
  
      if (!videoDoc) {
        throw new Error('Video document not found');
      }
  
      // Extract file IDs from the URLs
      const thumbnailId = getFileIdFromUrl(videoDoc.thumbnail);
      const videoFileId = getFileIdFromUrl(videoDoc.video);
  
      console.log(`Deleting thumbnail with ID: ${thumbnailId}`);
      console.log(`Deleting video with ID: ${videoFileId}`);
  
      // Delete the thumbnail file if it exists
      if (await checkFileExistence(thumbnailId)) {
        await storage.deleteFile(storageId, thumbnailId);
      } else {
        console.warn(`Thumbnail with ID ${thumbnailId} does not exist.`);
      }
  
      // Delete the video file if it exists
      if (await checkFileExistence(videoFileId)) {
        await storage.deleteFile(storageId, videoFileId);
      } else {
        console.warn(`Video with ID ${videoFileId} does not exist.`);
      }
  
      // Delete the video document
      await databases.deleteDocument(databaseId, videoCollectionId, videoId);
  
      console.log('Video and associated files deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error.message);
      throw error;
    }
  };