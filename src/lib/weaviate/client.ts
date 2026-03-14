// import weaviate, { WeaviateClient } from 'weaviate-ts-client';

// let client: WeaviateClient | null = null;

// export const getWeaviateClient = (): WeaviateClient => {
//   if (!client) {
//     // For local Docker setup
//     const isLocal = process.env.WEAVIATE_URL?.includes('localhost') || 
//                     !process.env.WEAVIATE_URL;
    
//     if (isLocal) {
//       client = weaviate.client({
//         scheme: 'http',
//         host: 'localhost:8080',
//       });
//     } else {
//       // For cloud/remote setup
//       client = weaviate.client({
//         scheme: process.env.WEAVIATE_URL?.startsWith('https') ? 'https' : 'http',
//         host: process.env.WEAVIATE_URL?.replace('https://', '').replace('http://', '') || '',
//         apiKey: process.env.WEAVIATE_API_KEY ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY) : undefined,
//       });
//     }
//   }
//   return client;
// };



// import weaviate, { WeaviateClient } from 'weaviate-ts-client';

// let client: WeaviateClient | null = null;

// export const getWeaviateClient = (): WeaviateClient => {
//   if (!client) {
//     const host = process.env.WEAVIATE_URL?.replace('https://', '');
    
//     if (!host) {
//       throw new Error('WEAVIATE_URL environment variable is not set');
//     }

//     console.log('Connecting to Weaviate at:', host); // Debug log
    
//     client = weaviate.client({
//       scheme: 'https',
//       host: host,
//       apiKey: process.env.WEAVIATE_API_KEY ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY) : undefined,
//       headers: {
//         'X-HuggingFace-Api-Key': process.env.HUGGINGFACE_API_KEY || '',
//       },
//     });
//   }
//   return client;
// };



import weaviate, { WeaviateClient } from 'weaviate-ts-client';

let client: WeaviateClient | null = null;

export const getWeaviateClient = (): WeaviateClient => {
  if (!client) {
    const host = process.env.NEXT_PUBLIC_WEAVIATE_URL?.replace('https://', '');
    
    if (!host) {
      throw new Error('NEXT_PUBLIC_WEAVIATE_URL environment variable is not set');
    }

    client = weaviate.client({
      scheme: 'https',
      host: host,
      apiKey: process.env.NEXT_PUBLIC_WEAVIATE_API_KEY 
        ? new weaviate.ApiKey(process.env.NEXT_PUBLIC_WEAVIATE_API_KEY) 
        : undefined,
      headers: {
        'X-HuggingFace-Api-Key': process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '',
      },
    });
  }
  return client;
};