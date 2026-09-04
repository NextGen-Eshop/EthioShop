import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function migrateEquipment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const Product = mongoose.model(
      'Product',
      new mongoose.Schema({}, { strict: false }),
      'products'
    );

    // 1. Replace Ethiopian Yirgacheffe Roast Coffee with Digital Precision Multimeter & Diagnostic Kit
    const coffeeRes = await Product.updateMany(
      {
        $or: [
          { _id: new mongoose.Types.ObjectId('6a971c3718b6b5946ac06bc6') },
          { name: /Ethiopian Yirgacheffe Roast Coffee/i },
          { category: 'coffee-tea' },
        ],
      },
      {
        $set: {
          name: 'Digital Precision Multimeter & Diagnostic Kit',
          category: 'electronics',
          price: 3450,
          originalPrice: 3800,
          countInStock: 18,
          description:
            'High-accuracy digital multimeter with true RMS auto-ranging and temperature probe for electrical diagnostic workflows.',
          image:
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
          images: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
            'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
          ],
          features: [
            'True RMS Auto-Ranging',
            'Oscilloscope Waveform Display',
            'Temperature Probe Included',
            'Backlit LCD Display',
            'CAT III 1000V Certified',
          ],
          specs: [
            { label: 'DC Voltage', value: '600mV - 1000V' },
            { label: 'AC Voltage', value: '6V - 750V' },
            { label: 'Display', value: '6000 Counts LCD' },
            { label: 'Safety Rating', value: 'CAT III 1000V' },
          ],
          rating: 4.9,
          reviewsCount: 65,
          shippingFee: 150,
          isFreeShipping: false,
          isActive: true,
        },
      }
    );
    console.log('Coffee & Tea product migrated:', coffeeRes);

    // 2. Replace Organic Shiro & Berbere Gourmet Spice Set with Laser Distance Meter & Optical Rangefinder (100m)
    const spiceRes = await Product.updateMany(
      {
        $or: [
          { _id: new mongoose.Types.ObjectId('6a971c3918b6b5946ac06bcf') },
          { name: /Organic Shiro & Berbere Gourmet Spice Set/i },
          { category: 'spices-food' },
        ],
      },
      {
        $set: {
          name: 'Laser Distance Meter & Optical Rangefinder (100m)',
          category: 'electronics',
          price: 4800,
          originalPrice: 5400,
          countInStock: 0,
          description:
            'Professional handheld 100-meter laser distance meter with ±1.5mm precision and multi-unit calculation for engineering and surveying.',
          image:
            'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600&q=80',
          images: [
            'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&q=80',
          ],
          features: [
            '100m Measuring Range',
            '±1.5mm High Precision',
            'Area, Volume & Pythagorean Calculation',
            'IP54 Dust & Splash Proof',
            'Backlit Multi-Line Display',
          ],
          specs: [
            { label: 'Range', value: '0.05 - 100m' },
            { label: 'Accuracy', value: '±1.5mm' },
            { label: 'Laser Class', value: 'Class II 635nm' },
            { label: 'Battery', value: '2x 1.5V AAA' },
          ],
          rating: 4.7,
          reviewsCount: 19,
          shippingFee: 150,
          isFreeShipping: false,
          isActive: true,
        },
      }
    );
    console.log('Spices & Food product migrated:', spiceRes);

    // 3. Ensure no products remain with coffee-tea or spices-food
    const deleteOld = await Product.deleteMany({
      category: { $in: ['coffee-tea', 'spices-food'] },
    });
    console.log('Any stale coffee-tea or spices-food deleted:', deleteOld);

    // 4. Verify all product categories in DB
    const allProducts = await Product.find({}, 'name category price');
    console.log('\nCurrent products in database:');
    allProducts.forEach((p) => console.log(`- [${p.category}] ${p.name} (${p.price} ETB)`));

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateEquipment();
