import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';
export default function robots():MetadataRoute.Robots{return{rules:[{userAgent:'*',allow:'/'},{userAgent:'OAI-SearchBot',allow:'/'}],sitemap:`${SITE_URL.replace(/\/$/,'')}/sitemap.xml`,host:SITE_URL}}
