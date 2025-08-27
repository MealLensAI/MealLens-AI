-- Add missing payment tables for Paystack integration
-- Run this in your Supabase SQL Editor

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    paystack_transaction_id text,
    paystack_reference text UNIQUE,
    amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'USD',
    status text DEFAULT 'pending',
    payment_method text,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create paystack_webhooks table
CREATE TABLE IF NOT EXISTS public.paystack_webhooks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    paystack_event_id text,
    paystack_reference text,
    event_data jsonb,
    processed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id text NOT NULL,
    status text DEFAULT 'active',
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    paystack_subscription_id text,
    paystack_customer_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paystack_webhooks_reference ON public.paystack_webhooks(paystack_reference);

-- Add RLS policies for payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" ON public.payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment transactions" ON public.payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add RLS policies for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add RLS policies for paystack_webhooks (admin only)
ALTER TABLE public.paystack_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all webhooks" ON public.paystack_webhooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Service can insert webhooks" ON public.paystack_webhooks
    FOR INSERT WITH CHECK (true);

-- Verify tables were created
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('payment_transactions', 'user_subscriptions', 'paystack_webhooks')
ORDER BY table_name, ordinal_position; 