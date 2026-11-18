<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'status')) {
                $table->string('status')->default('pending')->after('total_amount');
            }

            if (! Schema::hasColumn('transactions', 'payment_group')) {
                $table->string('payment_group')->nullable()->index()->after('status');
            }

            if (! Schema::hasColumn('transactions', 'payment_method')) {
                $table->string('payment_method')->default('cod')->after('payment_group');
            }

            if (! Schema::hasColumn('transactions', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('payment_method');
            }

            if (! Schema::hasColumn('transactions', 'snap_token')) {
                $table->string('snap_token')->nullable()->after('payment_status');
            }

            if (! Schema::hasColumn('transactions', 'snap_url')) {
                $table->text('snap_url')->nullable()->after('snap_token');
            }

            if (! Schema::hasColumn('transactions', 'phone')) {
                $table->string('phone')->nullable()->after('snap_url');
            }

            if (! Schema::hasColumn('transactions', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('phone');
            }

            if (! Schema::hasColumn('transactions', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('shipping_address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $columns = ['status', 'payment_group', 'payment_method', 'payment_status', 'snap_token', 'snap_url', 'phone', 'shipping_address', 'paid_at'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
