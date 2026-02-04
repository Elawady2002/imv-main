-- Inbox Money Vault Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE lead_status AS ENUM ('allocated', 'used', 'invalid');
CREATE TYPE email_tone AS ENUM ('friendly', 'professional', 'direct');
CREATE TYPE activity_action AS ENUM ('lead_allocated', 'email_generated', 'email_saved', 'offer_created', 'offer_updated');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  website TEXT,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  campaign TEXT,
  status lead_status DEFAULT 'allocated',
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  offer_id UUID,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  follow_up TEXT,
  tone email_tone DEFAULT 'professional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT,
  notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for email_templates.offer_id after offers table exists
ALTER TABLE public.email_templates
ADD CONSTRAINT fk_email_templates_offer
FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE SET NULL;

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action activity_action NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage limits table (tracks daily usage per user)
CREATE TABLE public.usage_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_allocated INTEGER DEFAULT 0,
  emails_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_allocated_at ON public.leads(allocated_at);
CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX idx_offers_user_id ON public.offers(user_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_usage_limits_user_date ON public.usage_limits(user_id, date);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own email templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own offers" ON public.offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own offers" ON public.offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offers" ON public.offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own offers" ON public.offers
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage limits" ON public.usage_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage limits" ON public.usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage limits" ON public.usage_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
