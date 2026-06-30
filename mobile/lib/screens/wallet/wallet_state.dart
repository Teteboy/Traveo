// ── Global wallet state — shared across the entire app ──────────────────────
// Any screen can read/write walletBalance and walletTransactions directly.

double walletBalance = 75000.0;

final List<Map<String, dynamic>> walletTransactions = [
  {'type': 'credit', 'label': 'Deposit',           'amount': 30000.0,  'date': 'Mar 1, 2026',  'icon': 'add'},
  {'type': 'debit',  'label': 'Flight Booking',     'amount': -27000.0, 'date': 'Feb 28, 2026', 'icon': 'flight'},
  {'type': 'credit', 'label': 'Deposit',           'amount': 60000.0,  'date': 'Feb 20, 2026', 'icon': 'add'},
  {'type': 'debit',  'label': 'Guide & Experience Booking', 'amount': -18000.0, 'date': 'Feb 15, 2026', 'icon': 'tour'},
  {'type': 'debit',  'label': 'Transfer to @alice', 'amount': -12000.0, 'date': 'Feb 10, 2026', 'icon': 'send'},
  {'type': 'credit', 'label': 'Transfer from @bob', 'amount': 12300.0,  'date': 'Feb 5, 2026',  'icon': 'receive'},
];
