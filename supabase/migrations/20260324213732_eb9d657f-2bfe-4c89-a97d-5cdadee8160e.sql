
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'kg_admin');

-- Create kindergartens table
CREATE TABLE public.kindergartens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.kindergartens ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  school_name TEXT,
  kindergarten_id UUID REFERENCES public.kindergartens(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  kindergarten_id UUID REFERENCES public.kindergartens(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  analysis JSONB,
  date TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create parents table
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- Create student_guardians table
CREATE TABLE public.student_guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'parent',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- Create invitation_codes table
CREATE TABLE public.invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  kindergarten_id UUID NOT NULL REFERENCES public.kindergartens(id),
  created_by TEXT NOT NULL,
  used_by TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- Create parent_reports table
CREATE TABLE public.parent_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  analysis_summary TEXT NOT NULL DEFAULT '',
  parent_message TEXT NOT NULL DEFAULT '',
  action_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

-- Create message_deliveries table
CREATE TABLE public.message_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.parent_reports(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  message_body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.message_deliveries ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies

-- Profiles: users can read all, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: users can read own, admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Kindergartens: authenticated can read, admins can manage
CREATE POLICY "Authenticated can view kindergartens" ON public.kindergartens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert kindergartens" ON public.kindergartens FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update kindergartens" ON public.kindergartens FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete kindergartens" ON public.kindergartens FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Students: teachers see own, admins see all
CREATE POLICY "Teachers can view own students" ON public.students FOR SELECT TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own students" ON public.students FOR UPDATE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete own students" ON public.students FOR DELETE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

-- Surveys: teachers see own, admins see all
CREATE POLICY "Teachers can view own surveys" ON public.surveys FOR SELECT TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can insert surveys" ON public.surveys FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own surveys" ON public.surveys FOR UPDATE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete own surveys" ON public.surveys FOR DELETE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

-- Attendance: teachers see own, admins see all
CREATE POLICY "Teachers can view own attendance" ON public.attendance FOR SELECT TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can insert attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update own attendance" ON public.attendance FOR UPDATE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete own attendance" ON public.attendance FOR DELETE TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

-- Parents: authenticated can manage
CREATE POLICY "Authenticated can view parents" ON public.parents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert parents" ON public.parents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update parents" ON public.parents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete parents" ON public.parents FOR DELETE TO authenticated USING (true);

-- Student guardians
CREATE POLICY "Authenticated can view guardians" ON public.student_guardians FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert guardians" ON public.student_guardians FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update guardians" ON public.student_guardians FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete guardians" ON public.student_guardians FOR DELETE TO authenticated USING (true);

-- Invitation codes: admins and kg_admins can manage
CREATE POLICY "Admins can view codes" ON public.invitation_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'kg_admin'));
CREATE POLICY "Admins can insert codes" ON public.invitation_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'kg_admin'));
CREATE POLICY "Admins can update codes" ON public.invitation_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'kg_admin'));

-- Parent reports
CREATE POLICY "Teachers can view own reports" ON public.parent_reports FOR SELECT TO authenticated USING (teacher_id = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can insert reports" ON public.parent_reports FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid()::text);
CREATE POLICY "Teachers can update own reports" ON public.parent_reports FOR UPDATE TO authenticated USING (teacher_id = auth.uid()::text);

-- Message deliveries
CREATE POLICY "Authenticated can view deliveries" ON public.message_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert deliveries" ON public.message_deliveries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update deliveries" ON public.message_deliveries FOR UPDATE TO authenticated USING (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, school_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'school_name', '')
  );
  -- Default role is teacher
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'teacher');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- KG Admin policies for students (view students in their kindergarten)
CREATE POLICY "KG admins can view kg students" ON public.students FOR SELECT TO authenticated 
  USING (
    kindergarten_id IN (
      SELECT kindergarten_id FROM public.profiles WHERE id = auth.uid()
    ) AND public.has_role(auth.uid(), 'kg_admin')
  );

-- KG Admin policies for surveys
CREATE POLICY "KG admins can view kg surveys" ON public.surveys FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE s.kindergarten_id = p.kindergarten_id
    ) AND public.has_role(auth.uid(), 'kg_admin')
  );
