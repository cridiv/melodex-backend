import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'tracks',
    resource_type: 'auto', 
  }),
});
