ALTER TABLE public.enquiries ALTER COLUMN email DROP NOT NULL;
DROP POLICY IF EXISTS "Anyone can submit a valid enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit a valid enquiry" ON public.enquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 200
  AND phone IS NOT NULL AND length(phone) <= 50
  AND length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
  AND (email IS NULL OR (length(email) <= 200 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND enquiry_type = ANY (ARRAY['renovation','development','landscaping','general'])
  AND length(btrim(message)) BETWEEN 1 AND 5000
);