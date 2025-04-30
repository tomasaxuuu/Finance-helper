<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportPdf(Request $request)
    {
        $transactions = $request->user()->transactions()->latest()->get();

        $html = '<h2>Список транзакций</h2><table border="1" cellpadding="5" cellspacing="0" width="100%">
            <thead>
                <tr>
                    <th>Тип</th>
                    <th>Сумма</th>
                    <th>Категория</th>
                    <th>Дата</th>
                </tr>
            </thead>
            <tbody>';

        foreach ($transactions as $t) {
            $html .= "<tr>
                        <td>{$t->type}</td>
                        <td>{$t->amount}</td>
                        <td>{$t->note}</td>
                        <td>{$t->date}</td>
                      </tr>";
        }

        $html .= '</tbody></table>';

        $pdf = Pdf::loadHTML($html);
        return $pdf->download('transactions.pdf');
    }
}
