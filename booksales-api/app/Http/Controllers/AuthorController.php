<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthorController extends Controller
{
    
    public function index()
    {
        $authors = Author::all();
        return response()->json([
            'success' => true,
            'message' => 'List of authors',
            'data'    => $authors
        ], 200);
    }

    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $author = Author::create([
            'name' => $request->name,
            'bio'  => $request->bio,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Author created successfully',
            'data'    => $author
        ], 201);
    }

  
    public function show($id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail author',
            'data'    => $author
        ], 200);
    }

   
    public function update(Request $request, $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $author->update([
            'name' => $request->name,
            'bio'  => $request->bio,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Author updated successfully',
            'data'    => $author
        ], 200);
    }

   
    public function destroy($id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);
        }

        $author->delete();

        return response()->json([
            'success' => true,
            'message' => 'Author deleted successfully'
        ], 200);
    }
}