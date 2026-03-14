import weaviate, { WeaviateClient } from 'weaviate-ts-client';

// Weaviate client configuration
const client: WeaviateClient = weaviate.client({
  scheme: process.env.WEAVIATE_SCHEME || 'http',
  host: process.env.WEAVIATE_HOST || 'localhost:8080',
});

export default client;