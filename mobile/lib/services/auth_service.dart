import 'api_service.dart';

/// Manages the current authenticated user state for the Flutter app
class AuthService {
  static AuthService? _instance;
  AuthService._();
  static AuthService get instance => _instance ??= AuthService._();

  Map<String, dynamic>? _currentUser;
  Map<String, dynamic>? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;

  final _api = ApiService.instance;

  /// Called on app start — tries to restore session
  Future<bool> tryRestoreSession() async {
    final token = await _api.getAccessToken();
    if (token == null) return false;
    try {
      _currentUser = await _api.getMe();
      return true;
    } catch (_) {
      await _api.clearTokens();
      return false;
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    _currentUser = await _api.login(email, password);
    return _currentUser!;
  }

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    _currentUser = await _api.register(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    );
    return _currentUser!;
  }

  Future<Map<String, dynamic>> registerProvider({
    required String companyName,
    required String businessType,
    String? description,
  }) async {
    await _api.registerProvider(
      companyName: companyName,
      businessType: businessType,
      description: description,
    );
    // Refresh user object with PROVIDER role
    _currentUser = await _api.getMe();
    return _currentUser!;
  }

  Future<void> refreshMe() async {
    _currentUser = await _api.getMe();
  }

  Future<void> logout() async {
    await _api.logout();
    _currentUser = null;
  }

  String get userRole =>
      _currentUser?['role']?.toString().toLowerCase() ?? 'user';
  bool get isProvider => userRole == 'provider';
  bool get isAdmin => userRole == 'admin';
  String get fullName => _currentUser?['fullName']?.toString() ?? '';
  String get email => _currentUser?['email']?.toString() ?? '';
}
