ALTER TABLE public.enquiries
 ADD COLUMN session_id uuid REFERENCES public.estimating_sessions(id),
 ADD COLUMN estimate_version_id uuid REFERENCES public.estimate_versions(id),
 ADD COLUMN project_snapshot jsonb,
 ADD COLUMN request_type text CHECK (request_type IN ('callback','site_visit','formal_quote','estimate_copy')),
 ADD COLUMN lead_status text NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new','contacted','survey_arranged','quoted','won','lost')),
 ADD COLUMN internal_notes text NOT NULL DEFAULT '',
 ADD COLUMN next_action text NOT NULL DEFAULT '',
 ADD COLUMN follow_up_at timestamptz,
 ADD COLUMN survey_at timestamptz,
 ADD COLUMN site_address text,
 ADD COLUMN visit_preference text;
CREATE UNIQUE INDEX enquiries_quote_request_unique ON public.enquiries(session_id,request_type);
GRANT UPDATE ON public.enquiries TO authenticated;
CREATE POLICY "Admins manage enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY "Anyone can submit a valid enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit a valid enquiry" ON public.enquiries FOR INSERT TO anon,authenticated WITH CHECK (
 length(btrim(name)) BETWEEN 1 AND 200 AND phone IS NOT NULL AND length(phone)<=50
 AND length(regexp_replace(phone,'[^0-9]','','g')) BETWEEN 7 AND 15
 AND (email IS NULL OR (length(email)<=200 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
 AND enquiry_type IN ('renovation','development','landscaping','general') AND length(btrim(message)) BETWEEN 1 AND 5000
 AND session_id IS NULL AND estimate_version_id IS NULL AND project_snapshot IS NULL AND request_type IS NULL
 AND lead_status='new' AND internal_notes='' AND next_action='' AND follow_up_at IS NULL AND survey_at IS NULL AND site_address IS NULL AND visit_preference IS NULL);
CREATE OR REPLACE FUNCTION public.save_quote_enquiry(p_session uuid,p_estimate uuid,p_name text,p_phone text,p_email text,p_type text,p_request text,p_message text,p_address text DEFAULT NULL,p_preference text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_state jsonb; v_id uuid;
BEGIN
 SELECT project_state INTO v_state FROM public.estimating_sessions WHERE id=p_session FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown quotation'; END IF;
 IF p_estimate IS NOT NULL AND (NOT EXISTS(SELECT 1 FROM public.estimate_versions WHERE id=p_estimate AND session_id=p_session)
 OR v_state->>'currentEstimateId' IS DISTINCT FROM p_estimate::text
 OR v_state->>'revision' IS DISTINCT FROM v_state->>'estimateRevision' OR (v_state->>'pending')::boolean) THEN RAISE EXCEPTION 'Estimate does not belong to the current quotation'; END IF;
 IF length(btrim(p_name)) NOT BETWEEN 1 AND 200 OR p_phone IS NULL OR length(p_phone)>50 OR length(regexp_replace(p_phone,'[^0-9]','','g')) NOT BETWEEN 7 AND 15
 OR (p_email IS NOT NULL AND (length(p_email)>200 OR p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
 OR p_type NOT IN ('renovation','development','landscaping','general') OR p_request NOT IN ('callback','site_visit','formal_quote','estimate_copy')
 OR length(btrim(p_message)) NOT BETWEEN 1 AND 5000 OR length(coalesce(p_address,''))>500 OR length(coalesce(p_preference,''))>300 THEN RAISE EXCEPTION 'Invalid enquiry'; END IF;
 INSERT INTO public.enquiries(name,phone,email,enquiry_type,message,session_id,estimate_version_id,project_snapshot,request_type,site_address,visit_preference)
 VALUES(p_name,p_phone,p_email,p_type,p_message,p_session,p_estimate,v_state->'specification',p_request,p_address,p_preference)
 ON CONFLICT(session_id,request_type) DO NOTHING RETURNING id INTO v_id;
 IF v_id IS NULL THEN SELECT id INTO v_id FROM public.enquiries WHERE session_id=p_session AND request_type=p_request; END IF;
 INSERT INTO public.chat_conversations(id,enquiry_id) VALUES(p_session,v_id)
 ON CONFLICT(id) DO UPDATE SET enquiry_id=EXCLUDED.enquiry_id;
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.save_quote_enquiry(uuid,uuid,text,text,text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_quote_enquiry(uuid,uuid,text,text,text,text,text,text,text,text) TO service_role;