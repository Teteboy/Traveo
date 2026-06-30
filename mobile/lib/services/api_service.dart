import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Traveo API Service — connects Flutter app to Node.js backend
class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3001/v1'; // Android emulator
  // Use 'http://localhost:3001/v1' for web/desktop

  static ApiService? _instance;
  ApiService._();
  static ApiService get instance => _instance ??= ApiService._();

  // ─── Token Management ──────────────────────────────────────────────────────

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('traveo_access_token');
  }

  Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('traveo_refresh_token');
  }

  Future<void> setTokens(String access, String refresh) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('traveo_access_token', access);
    await prefs.setString('traveo_refresh_token', refresh);
  }

  Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('traveo_access_token');
    await prefs.remove('traveo_refresh_token');
  }

  // ─── HTTP Helpers ──────────────────────────────────────────────────────────

  Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth) {
      final token = await getAccessToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    if (response.statusCode == 401) {
      // Try token refresh
      final refreshed = await _tryRefresh();
      if (!refreshed) {
        await clearTokens();
        throw ApiException('Session expirée', 401, 'UNAUTHORIZED');
      }
      throw ApiException('Retry needed', 401, 'RETRY');
    }

    final body = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    throw ApiException(
      body['message'] ?? 'Erreur serveur',
      response.statusCode,
      body['code'] ?? 'UNKNOWN',
    );
  }

  Future<bool> _tryRefresh() async {
    final refreshToken = await getRefreshToken();
    if (refreshToken == null) return false;
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'];
        await setTokens(data['accessToken'], data['refreshToken']);
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<dynamic> get(String path,
      {bool auth = true, Map<String, String>? queryParams}) async {
    final uri =
        Uri.parse('$baseUrl$path').replace(queryParameters: queryParams);
    final res = await http.get(uri, headers: await _headers(auth: auth));
    return _handleResponse(res);
  }

  Future<dynamic> post(String path,
      {Map<String, dynamic>? body, bool auth = true}) async {
    final res = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(auth: auth),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(res);
  }

  Future<dynamic> patch(String path,
      {Map<String, dynamic>? body, bool auth = true}) async {
    final res = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(auth: auth),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(res);
  }

  Future<dynamic> delete(String path, {bool auth = true}) async {
    final res = await http.delete(Uri.parse('$baseUrl$path'),
        headers: await _headers(auth: auth));
    return _handleResponse(res);
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await post('/auth/login',
        body: {'email': email, 'password': password}, auth: false);
    final data = res['data'];
    await setTokens(
        data['tokens']['accessToken'], data['tokens']['refreshToken']);
    return data['user'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
    String country = 'CM',
  }) async {
    final res = await post('/auth/register',
        body: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          if (phone != null) 'phone': phone,
          'country': country,
        },
        auth: false);
    final data = res['data'];
    await setTokens(
        data['tokens']['accessToken'], data['tokens']['refreshToken']);
    return data['user'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await get('/auth/me');
    return res['data']['user'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateMe(Map<String, dynamic> patch) async {
    final res = await patch_('/auth/me', body: patch);
    return res['data']['user'] as Map<String, dynamic>;
  }

  // Wrapper to avoid keyword clash in callers using `patch`
  Future<dynamic> patch_(String path,
          {Map<String, dynamic>? body, bool auth = true}) =>
      patch(path, body: body, auth: auth);

  Future<Map<String, dynamic>> registerProvider({
    required String companyName,
    required String businessType,
    String? description,
  }) async {
    final res = await post('/providers/register', body: {
      'companyName': companyName,
      'businessType': businessType,
      if (description != null) 'description': description,
    });
    return res['data'] as Map<String, dynamic>;
  }

  Future<void> logout() async {
    final refresh = await getRefreshToken();
    try {
      await post('/auth/logout', body: {'refreshToken': refresh});
    } catch (_) {}
    await clearTokens();
  }

  // ─── Destinations ─────────────────────────────────────────────────────────

  Future<List<dynamic>> getDestinations(
      {int page = 1, int limit = 20, String? search, String? country}) async {
    final res = await get('/destinations', queryParams: {
      'page': '$page',
      'limit': '$limit',
      if (search != null) 'search': search,
      if (country != null) 'country': country,
    });
    return res['items'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> getDestination(String id) async {
    final res = await get('/destinations/$id');
    return res['data'] as Map<String, dynamic>;
  }

  // ─── Flights ──────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> searchFlights({
    required String origin,
    required String destination,
    required String departDate,
    int passengers = 1,
    String cabin = 'economy',
  }) async {
    final res = await get('/flights/search', queryParams: {
      'origin': origin,
      'destination': destination,
      'departDate': departDate,
      'passengers': '$passengers',
      'cabin': cabin,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> bookFlight({
    required String offerId,
    required Map<String, dynamic> passenger,
    required Map<String, dynamic> paymentMethod,
  }) async {
    final res = await post('/flights/book', body: {
      'offerId': offerId,
      'passenger': passenger,
      'paymentMethod': paymentMethod
    });
    return res['data'] as Map<String, dynamic>;
  }

  // ─── Hotels / Services ────────────────────────────────────────────────────

  Future<List<dynamic>> getHotels(
      {int page = 1, int limit = 20, String? search, String? country}) async {
    final res = await get('/hotels', queryParams: {
      'page': '$page',
      'limit': '$limit',
      if (search != null) 'search': search,
      if (country != null) 'country': country
    });
    return res['items'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> getHotel(String id) async {
    final res = await get('/hotels/$id');
    return res['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> bookHotel(
      String id, Map<String, dynamic> data) async {
    final res = await post('/hotels/$id/book', body: data);
    return res['data'] as Map<String, dynamic>;
  }

  Future<List<dynamic>> getEvents({int page = 1, int limit = 20}) async {
    final res =
        await get('/events', queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  Future<List<dynamic>> getGuides({int page = 1, int limit = 20}) async {
    final res =
        await get('/guides', queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  Future<List<dynamic>> getRestaurants({int page = 1, int limit = 20}) async {
    final res = await get('/restaurants',
        queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  Future<List<dynamic>> getTransfers({int page = 1, int limit = 20}) async {
    final res = await get('/transfers',
        queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getBookings(
      {int page = 1, int limit = 20, String? status, String? type}) async {
    final res = await get('/bookings', queryParams: {
      'page': '$page',
      'limit': '$limit',
      if (status != null) 'status': status,
      if (type != null) 'type': type,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBooking(String id) async {
    final res = await get('/bookings/$id');
    return res as Map<String, dynamic>;
  }

  Future<void> cancelBooking(String id) async {
    await delete('/bookings/$id');
  }

  Future<Map<String, dynamic>> getBookingTicket(String id) async {
    final res = await get('/bookings/$id/ticket');
    return res['data'] as Map<String, dynamic>;
  }

  // ─── Wallet ───────────────────────────────────────────────────────────────

  Future<List<dynamic>> getWalletBalance() async {
    final res = await get('/wallet/balance');
    return res['data']['balances'] as List<dynamic>;
  }

  Future<List<dynamic>> getWalletTransactions(
      {int page = 1, int limit = 20}) async {
    final res = await get('/wallet/transactions',
        queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  Future<void> addFunds(
      {required int amount,
      String currency = 'XAF',
      String? provider,
      String? phone}) async {
    await post('/wallet/add-funds', body: {
      'amount': amount,
      'currency': currency,
      if (provider != null) 'provider': provider,
      if (phone != null) 'phone': phone
    });
  }

  Future<void> withdraw(
      {required int amount,
      String currency = 'XAF',
      String? provider,
      String? phone}) async {
    await post('/wallet/withdraw', body: {
      'amount': amount,
      'currency': currency,
      if (provider != null) 'provider': provider,
      if (phone != null) 'phone': phone
    });
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> initializeCampayPayment({
    required String bookingId,
    required int amount,
    String currency = 'XAF',
    required String provider,
    required Map<String, dynamic> customer,
  }) async {
    final res = await post('/payments/campay/initialize', body: {
      'bookingId': bookingId,
      'amount': amount,
      'currency': currency,
      'provider': provider,
      'customer': customer,
    });
    return res['data'] as Map<String, dynamic>;
  }

  // ─── Visa ─────────────────────────────────────────────────────────────────

  Future<List<dynamic>> getVisaDestinations() async {
    final res = await get('/visa/destinations', auth: false);
    return res['data'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> getVisaRequirements(String countryCode) async {
    final res = await get('/visa/$countryCode/requirements', auth: false);
    return res['data'] as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMyVisaApplications({int page = 1}) async {
    final res = await get('/visa/applications', queryParams: {'page': '$page'});
    return res['items'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> createVisaApplication({
    required String countryCode,
    required Map<String, dynamic> applicant,
    Map<String, dynamic>? travelDates,
  }) async {
    final res = await post('/visa/applications', body: {
      'countryCode': countryCode,
      'applicant': applicant,
      if (travelDates != null) 'travelDates': travelDates,
    });
    return res['data']['application'] as Map<String, dynamic>;
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  Future<List<dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    final res = await get('/notifications',
        queryParams: {'page': '$page', 'limit': '$limit'});
    return res['items'] as List<dynamic>;
  }

  Future<void> markNotificationRead(String id) async {
    await patch('/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await patch('/notifications/read-all');
  }

  // ─── Discover ─────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getDiscoverFeed({int page = 1}) async {
    final res =
        await get('/discover', queryParams: {'page': '$page'}, auth: false);
    return res as Map<String, dynamic>;
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final String code;
  ApiException(this.message, this.statusCode, this.code);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
