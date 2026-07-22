import { supabase } from '@/lib/supabase';
import type { CommunityPost, CommunityComment } from '@/types';

export async function fetchPosts(): Promise<CommunityPost[]> {
  const { data } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
  return (data as CommunityPost[] | null) ?? [];
}

export async function createPost(
  userId: string, userName: string, userAvatar: string,
  title: string, content: string, category: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('community_posts').insert({
    user_id: userId, user_name: userName, user_avatar: userAvatar,
    title, content, category,
  });
  return { error: error?.message ?? null };
}

export async function deletePost(postId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('community_posts').delete().eq('id', postId).eq('user_id', userId);
  return { error: error?.message ?? null };
}

export async function fetchComments(postId: string): Promise<CommunityComment[]> {
  const { data } = await supabase
    .from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  return (data as CommunityComment[] | null) ?? [];
}

export async function addComment(
  postId: string, userId: string, userName: string, userAvatar: string, content: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('community_comments').insert({
    post_id: postId, user_id: userId, user_name: userName, user_avatar: userAvatar, content,
  });
  if (error) return { error: error.message };

  await supabase.rpc('increment_post_comments', { post_id: postId });
  return { error: null };
}

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  const { data: existing } = await supabase
    .from('community_likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle();

  if (existing) {
    await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId);
    await supabase.rpc('increment_post_likes', { post_id: postId, amount: -1 });
    return { liked: false };
  } else {
    await supabase.from('community_likes').insert({ post_id: postId, user_id: userId });
    await supabase.rpc('increment_post_likes', { post_id: postId, amount: 1 });
    return { liked: true };
  }
}

export async function checkLiked(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('community_likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  return !!data;
}
