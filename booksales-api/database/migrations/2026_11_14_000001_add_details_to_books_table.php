<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            if (! Schema::hasColumn('books', 'genre_id')) {
                $table->foreignId('genre_id')->nullable()->after('author_id')
                    ->constrained('genres')->nullOnDelete();
            }

            if (! Schema::hasColumn('books', 'stock')) {
                $table->integer('stock')->default(0)->after('price');
            }

            if (! Schema::hasColumn('books', 'cover')) {
                $table->string('cover')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            if (Schema::hasColumn('books', 'genre_id')) {
                $table->dropConstrainedForeignId('genre_id');
            }

            if (Schema::hasColumn('books', 'stock')) {
                $table->dropColumn('stock');
            }

            if (Schema::hasColumn('books', 'cover')) {
                $table->dropColumn('cover');
            }
        });
    }
};
