import { Request, Response } from 'express';
import resolveMapsLink from '../utils/mapsResolver';

export const resolveMaps = async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) return res.status(400).json({ message: 'Missing url in body' });

    const resolved = await resolveMapsLink(url);
    if (!resolved) return res.status(404).json({ message: 'Coordinates not found' });

    res.json(resolved);
  } catch (err) {
    console.error('mapsResolverController error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default resolveMaps;
