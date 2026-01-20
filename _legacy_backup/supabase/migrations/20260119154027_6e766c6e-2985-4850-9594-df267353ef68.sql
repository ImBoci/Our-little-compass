-- Create foods table
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view foods)
CREATE POLICY "Anyone can view foods" 
ON public.foods 
FOR SELECT 
USING (true);

-- Create policy for public insert access (for simplicity, anyone can add foods)
CREATE POLICY "Anyone can insert foods" 
ON public.foods 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Anyone can update foods" 
ON public.foods 
FOR UPDATE 
USING (true);

-- Create policy for public delete access
CREATE POLICY "Anyone can delete foods" 
ON public.foods 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_foods_updated_at
BEFORE UPDATE ON public.foods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial food data
INSERT INTO public.foods (name, description, category) VALUES
('Pizza Margherita', 'Classic Italian pizza with tomato, mozzarella, and basil', 'Italian'),
('Sushi Roll', 'Fresh fish rolled with rice and seaweed', 'Japanese'),
('Tacos al Pastor', 'Mexican tacos with marinated pork and pineapple', 'Mexican'),
('Pad Thai', 'Stir-fried rice noodles with shrimp and peanuts', 'Thai'),
('Cheeseburger', 'Juicy beef patty with cheese and fresh toppings', 'American'),
('Butter Chicken', 'Creamy tomato-based curry with tender chicken', 'Indian'),
('Croissant', 'Flaky French pastry perfect for breakfast', 'French'),
('Pho', 'Vietnamese noodle soup with aromatic broth', 'Vietnamese'),
('Fish and Chips', 'Battered fish with crispy fries', 'British'),
('Falafel Wrap', 'Crispy chickpea balls in warm pita bread', 'Middle Eastern');