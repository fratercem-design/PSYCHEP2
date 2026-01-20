'use server';

import { db } from '@/db';
import { submissions, ads } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function approveSubmission(submissionId: number) {
  await db.update(submissions).set({ status: 'approved' }).where(eq(submissions.id, submissionId));
  revalidatePath('/admin');
}

export async function rejectSubmission(submissionId: number) {
  await db.update(submissions).set({ status: 'rejected' }).where(eq(submissions.id, submissionId));
  revalidatePath('/admin');
}

export async function approveAd(adId: number) {
  await db.update(ads).set({ status: 'active' }).where(eq(ads.id, adId));
  revalidatePath('/admin');
}

export async function rejectAd(adId: number) {
  await db.update(ads).set({ status: 'pending' }).where(eq(ads.id, adId));
  revalidatePath('/admin');
}

export async function deleteAd(adId: number) {
  await db.delete(ads).where(eq(ads.id, adId));
  revalidatePath('/admin');
}