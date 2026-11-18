<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::with('user')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesan user',
            'data' => $contacts,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Periksa kembali data pesan.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth('api')->user();

        $contact = Contact::create([
            'user_id' => $user?->id,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim ke admin.',
            'data' => $contact,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::find($id);

        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan tidak ditemukan.',
            ], 404);
        }

        $contact->update([
            'is_read' => $request->boolean('is_read', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesan diperbarui.',
            'data' => $contact,
        ], 200);
    }

    public function destroy($id)
    {
        $contact = Contact::find($id);

        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Pesan tidak ditemukan.',
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dihapus.',
        ], 200);
    }
}
