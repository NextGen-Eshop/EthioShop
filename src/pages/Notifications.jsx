import { motion } from 'framer-motion';

const notifications = [
  {
    id: 1,
    title: 'Order Delivered!',
    message: 'Your order #ORD-001 has been successfully delivered. Enjoy your purchase!',
    time: '2 hours ago',
    icon: '📦',
    color: 'bg-emerald-50 text-emerald-600',
    isNew: true
  },
  {
    id: 2,
    title: 'Flash Sale Alert ⚡',
    message: 'Up to 50% off on all electronics this weekend. Don\'t miss out!',
    time: '5 hours ago',
    icon: '🔥',
    color: 'bg-amber-50 text-amber-600',
    isNew: true
  },
  {
    id: 3,
    title: 'Security Update',
    message: 'Your profile password was successfully updated last night.',
    time: '1 day ago',
    icon: '🛡️',
    color: 'bg-indigo-50 text-indigo-600',
    isNew: false
  },
  {
    id: 4,
    title: 'Refund Processed',
    message: 'The refund for Order #ORD-892 has been issued to your original payment method.',
    time: '3 days ago',
    icon: '💳',
    color: 'bg-slate-50 text-slate-600',
    isNew: false
  }
];

const fadeInUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export default function Notifications() {
  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-12 py-12 md:py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Notifications</h1>
          <p className="text-gray-500 font-medium">Stay updated with your orders and special offers.</p>
        </div>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className={`flex items-start gap-5 p-6 rounded-3xl border border-gray-100 transition-all hover:shadow-xl hover:shadow-gray-100/50 group bg-white ${n.isNew ? 'ring-1 ring-indigo-100' : ''}`}
          >
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl text-2xl shadow-sm ${n.color}`}>
              {n.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{n.title}</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{n.message}</p>
              {n.isNew && (
                <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="px-8 py-3 bg-gray-50 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all">
          Load older notifications
        </button>
      </div>
    </div>
  );
}
