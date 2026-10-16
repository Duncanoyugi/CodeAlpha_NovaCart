export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 'Uasin Gishu', 'Meru', 'Nyeri',
  'Kakamega', 'Kisii', 'Kilifi', 'Kwale', 'Bungoma', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kericho',
  'Kirinyaga', 'Kitui', 'Laikipia', 'Lamu', 'Makueni', 'Mandera', 'Marsabit', 'Migori', 'Muranga', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi', 'Trans Nzoia',
  'Turkana', 'Vihiga', 'Wajir', 'West Pokot', 'Baringo', 'Bomet', 'Busia', 'Elgeyo Marakwet',
].sort();

/** Accepts 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX */
export const KENYAN_PHONE = /^(?:\+?254|0)?[17]\d{8}$/;

export const cleanPhone = (value: string) => value.replace(/[\s\-()]/g, '');
