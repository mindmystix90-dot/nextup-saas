/*
# NextUp SaaS — RPC helper functions

1. New Functions
- `increment_affiliate_registrations(referrer_uid)` — increments the registrations counter on affiliate_stats for the referrer
- `increment_affiliate_clicks(referrer_uid)` — increments clicks counter
- `increment_post_likes(post_id, amount)` — increments/decrements likes_count on community_posts
- `increment_post_comments(post_id)` — increments comments_count on community_posts

2. Security
- All functions run as SECURITY DEFINER so they can update rows the caller may not own directly
- Functions are volatile and accept parameters

3. Notes
- These handle atomic counter increments that would otherwise require read-modify-write in the client
*/

CREATE OR REPLACE FUNCTION increment_affiliate_registrations(referrer_uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_stats SET registrations = registrations + 1, updated_at = now()
  WHERE user_id = referrer_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_affiliate_clicks(referrer_uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_stats SET clicks = clicks + 1, updated_at = now()
  WHERE user_id = referrer_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(0, likes_count + amount)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_comments(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
