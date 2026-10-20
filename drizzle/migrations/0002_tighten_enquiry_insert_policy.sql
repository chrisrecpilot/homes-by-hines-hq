DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit a valid enquiry" ON public.enquiries
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 200
  AND length(email) <= 200 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR length(phone) <= 50)
  AND enquiry_type IN ('renovation','development','landscaping','general')
  AND length(btrim(message)) BETWEEN 1 AND 5000
);