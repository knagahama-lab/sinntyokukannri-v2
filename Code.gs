/**
 * 営業進捗管理システム — Google Apps Script webapp
 * https://github.com/keigoderakkusu/sinntyokukannri
 */

/* ============================================================
   WEB APP
============================================================ */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'diagSheetProbe') {
    var info = {};
    try {
      var props = PropertiesService.getScriptProperties();
      info.orderSync_spreadsheetId = props.getProperty('orderSync_spreadsheetId');
      info.orderSync_sheetName = props.getProperty('orderSync_sheetName');
      // ids=ID1,ID2,... で複数シートを一括調査。rows=先頭何行を返すか(既定8, 最大20)
      var ids = String(e.parameter.ids || e.parameter.id || info.orderSync_spreadsheetId || '')
        .split(',').map(function(s){ return s.trim(); }).filter(String);
      // 管理コンソールで設定済みの連携シートIDも併せて調査（IDのみ、データ本体は返さない）
      try {
        var cfg = (JSON.parse(loadData() || '{}').config) || {};
        info.linkedConfig = {
          linkageSheetId: cfg.linkageSheetId || '', linkageSheetName: cfg.linkageSheetName || '',
          linkageUrl: cfg.linkageUrl || '',
          syncSheetId: cfg.syncSheetId || '', syncSheetName: cfg.syncSheetName || '',
          orderSyncSheetId: cfg.orderSyncSheetId || '', orderSyncSheetName: cfg.orderSyncSheetName || '',
        };
        [cfg.linkageSheetId, cfg.syncSheetId, cfg.orderSyncSheetId, info.orderSync_spreadsheetId].forEach(function(x) {
          x = String(x || '').trim();
          if (x && ids.indexOf(x) < 0) ids.push(x);
        });
      } catch (eCfg) { info.linkedConfigError = eCfg.message; }
      var nRows = Math.min(parseInt(e.parameter.rows, 10) || 8, 20);
      info.spreadsheets = ids.map(function(sid) {
        var r = { id: sid };
        try {
          var ss = SpreadsheetApp.openById(sid);
          r.ssName = ss.getName();
          r.sheets = ss.getSheets().map(function(sh) {
            var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
            var top = lastRow > 0 && lastCol > 0
              ? sh.getRange(1, 1, Math.min(lastRow, nRows), Math.min(lastCol, 40)).getDisplayValues()
                  .map(function(row){ return row.map(function(v){ return String(v).substring(0, 40); }); })
              : [];
            return { name: sh.getName(), gid: sh.getSheetId(), rows: lastRow, cols: lastCol, top: top };
          });
        } catch (err2) { r.error = err2.message; }
        return r;
      });
      var activeTriggers = ScriptApp.getProjectTriggers().map(function(t){ return t.getHandlerFunction(); });
      info.activeTriggers = activeTriggers;
    } catch (err) {
      info.error = err.message;
    }
    var outp = ContentService.createTextOutput(JSON.stringify(info, null, 2));
    outp.setMimeType(ContentService.MimeType.JSON);
    return outp;
  }
  if (e && e.parameter && e.parameter.action === 'getForLink') {
    var data = loadData();
    var output = ContentService.createTextOutput(data || '{}');
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
  // ★ v3アーキテクチャ: 実測により判明した制約に基づく設計。
  // ・google.script.run(RPC)自体は280KBのペイロードでも確実に動く
  //   ことをテストアプリで実証済み。
  // ・一方、GASが「最初に送るページ本体」に巨大な<script>を直接
  //   埋め込むと、サンドボックスの初期化(document.write)が
  //   ランダムな位置で壊れる(何度やっても壊れる場所が変わる=
  //   コード内容のバグではなく転送そのものの不安定さ)。
  // → 初回に送るHTMLは小さく保ち(構造+CSSのみ)、本体JS(約280KB、
  //   4ファイル分)は google.script.run で取得してから動的に
  //   <script>要素として注入する。
  // index.html自体は構造+CSSのみで十分小さいため、テンプレート評価
  // (include('styles')/include('app')の展開)を使っても問題なし
  // ——実測で確認済みなのは「巨大なJSの直接埋め込み」だけがNGという点。
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('営業進捗管理システム')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * クライアント側の起動処理(appjs4.html末尾)から google.script.run で
 * 呼び出される。メインJS(appjs1〜4.html、合計約280KB)から<script>
 * タグを取り除いた生のJSコードと、保存済みデータをまとめて返す。
 * このRPC呼び出し自体は実測で問題なく動作することを確認済み。
 */
/**
 * 値上げインパクトページ用データ。getAppBundle()の巨大なコード文字列
 * にJSONを埋め込むと、google.script.runの転送でペイロードが肥大化し
 * 切り詰め（Unexpected end of input）を誘発するリスクがあるため、
 * 別の小さなRPC呼び出しとして分離している。
 */
function getPriceImpactData() {
  return {"grand_total":1312521478.0,"board_totals":{"M2402A":104509187.99999999,"C2401A":68970149.99999999,"D2101A":846961610.0000001,"E2101B":138179780.0,"DE2101A1":29286810.000000004,"M2503A":31918040.0,"E2301B":35372400.0,"E2501B":57323500.0},"machines":[{"name":"e:D61","qty":12000.0,"impact":180149400.0,"detail":[{"cat":"主基板","board":"三球(FJ+M2422B)","before":0.0,"after":0.0,"delta":0.0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":17609399.999999996},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":93243480.00000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":57177840.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":12118680.000000002}]},{"name":"e:C47","qty":7000.0,"impact":105087150.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":10272149.999999998},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":54392030.00000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":33353739.999999996},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":7069230.000000001}]},{"name":"e:A88","qty":12000.0,"impact":98217720.00000001,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":4974240.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":93243480.00000001},{"cat":"演出基板(E)","board":"E2503B","before":699.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE2502A","before":268.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:A89","qty":12000.0,"impact":98217720.00000001,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":4974240.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":93243480.00000001},{"cat":"演出基板(E)","board":"E2503B","before":699.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE2502A","before":268.0,"after":null,"delta":0,"impact":0.0}]},{"name":"L:E60","qty":10000.0,"impact":92915300.00000001,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":15212399.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":77702900.00000001},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"L:E65","qty":10000.0,"impact":92915300.00000001,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":15212399.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":77702900.00000001},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"L:E64","qty":8000.0,"impact":74332240.0,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":12169919.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":62162320.00000001},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"L:E65","qty":8000.0,"impact":74332240.0,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":12169919.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":62162320.00000001},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"L:E66","qty":8000.0,"impact":74332240.0,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":12169919.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":62162320.00000001},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:D62","qty":8000.0,"impact":65478480.00000001,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":3316160.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":62162320.00000001},{"cat":"演出基板(E)","board":"E2503B","before":699.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE2502A","before":268.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:D63","qty":20000.0,"impact":54149200.0,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":8290400.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2501B","before":620.0,"after":2912.94,"delta":2292.94,"impact":45858800.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]},{"name":"e:A85B","qty":3000.0,"impact":45037350.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":4402349.999999999},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":23310870.000000004},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":14294460.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":3029670.0000000005}]},{"name":"e:A85甘","qty":3000.0,"impact":45037350.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":4402349.999999999},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":23310870.000000004},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":14294460.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":3029670.0000000005}]},{"name":"L:NA09","qty":4000.0,"impact":43035920.0,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":6084959.999999999},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":5869799.999999999},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":31081160.000000004},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:A84B","qty":8000.0,"impact":31952400.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":11739599.999999998},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2301B","before":661.0,"after":3187.6,"delta":2526.6,"impact":20212800.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]},{"name":"L:E62","qty":12700.0,"impact":19319747.999999996,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":19319747.999999996},{"cat":"払出基板","board":"C2101B","before":559.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D1401C","before":null,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:A84C","qty":4000.0,"impact":15976200.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":5869799.999999999},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2301B","before":661.0,"after":3187.6,"delta":2526.6,"impact":10106400.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]},{"name":"e:C46C","qty":1000.0,"impact":15012450.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":1467449.9999999998},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":7770290.000000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":4764820.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":1009890.0000000001}]},{"name":"e:A85甘","qty":1000.0,"impact":15012450.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":1467449.9999999998},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":7770290.000000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":4764820.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":1009890.0000000001}]},{"name":"e:A86甘","qty":1000.0,"impact":15012450.0,"detail":[{"cat":"主基板","board":"三球","before":0.0,"after":0.0,"delta":0.0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":1467449.9999999998},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":7770290.000000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":4764820.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":1009890.0000000001}]},{"name":"e:D61甘","qty":1000.0,"impact":15012450.0,"detail":[{"cat":"主基板","board":"三球","before":0.0,"after":0.0,"delta":0.0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":1467449.9999999998},{"cat":"液晶制御(D)","board":"D2101A","before":743.0,"after":8513.29,"delta":7770.290000000001,"impact":7770290.000000001},{"cat":"演出基板(E)","board":"E2101B","before":700.0,"after":5464.82,"delta":4764.82,"impact":4764820.0},{"cat":"液晶IF基板(DE)","board":"DE2101A1","before":297.0,"after":1306.89,"delta":1009.8900000000001,"impact":1009890.0000000001}]},{"name":"e:A87ｻﾌﾞ","qty":5000.0,"impact":13537300.0,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":2072600.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2501B","before":620.0,"after":2912.94,"delta":2292.94,"impact":11464700.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]},{"name":"L:E63","qty":8000.0,"impact":12169919.999999998,"detail":[{"cat":"主基板","board":"M2402A","before":874.0,"after":2395.24,"delta":1521.2399999999998,"impact":12169919.999999998},{"cat":"払出基板","board":"C2502A","before":566.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"D1401C","before":null,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2102B","before":858.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"DE1802A","before":280.0,"after":null,"delta":0,"impact":0.0}]},{"name":"e:A87","qty":20000.0,"impact":8290400.0,"detail":[{"cat":"主基板","board":"M2503A","before":686.0,"after":1100.52,"delta":414.52,"impact":8290400.0},{"cat":"払出基板","board":"C2501C","before":919.0,"after":null,"delta":0,"impact":0.0},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2501B","before":2912.94,"after":null,"delta":0,"impact":0.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]},{"name":"e:D60甘","qty":2000.0,"impact":7988100.0,"detail":[{"cat":"主基板","board":"M2401A","before":838.0,"after":null,"delta":0,"impact":0.0},{"cat":"払出基板","board":"C2401A","before":1064.0,"after":2531.45,"delta":1467.4499999999998,"impact":2934899.9999999995},{"cat":"液晶制御(D)","board":"SNB5163A-00","before":5080.0,"after":null,"delta":0,"impact":0.0},{"cat":"演出基板(E)","board":"E2301B","before":661.0,"after":3187.6,"delta":2526.6,"impact":5053200.0},{"cat":"液晶IF基板(DE)","board":"なし","before":0.0,"after":0.0,"delta":0.0,"impact":0.0}]}],"parts_by_board":{"C2501C":[{"part_code":"1P1308931E80178SCF","part_name":"CN 8931E-080-178S-C-F","unit_cost_up":68,"qty_per_board":1,"board_cost_up":68},{"part_code":"1P130-FAS11-028-4","part_name":"FAS11-028-4","unit_cost_up":31,"qty_per_board":1,"board_cost_up":31}],"D2101A":[{"part_code":"1P1308930E040MSFET","part_name":"8930E-040MS-F-E-T","unit_cost_up":22,"qty_per_board":2,"board_cost_up":44}],"D2101A1":[{"part_code":"1P1308930E040MSFET","part_name":"8930E-040MS-F-E-T","unit_cost_up":22,"qty_per_board":2,"board_cost_up":44}],"E2101B":[],"E2301B":[],"E2501B":[],"M2401A":[],"M2402A":[{"part_code":"1P1308931E80178SCF","part_name":"CN 8931E-080-178S-C-F","unit_cost_up":68,"qty_per_board":6,"board_cost_up":408}],"M2503A":[]}};
}

/**
 * 重要な既知の罠(2026-09-02実測で確認・再現済み):
 * HtmlService.createHtmlOutputFromFile().getContent()は.htmlファイルの
 * 中身をJS文字列として認識せず素朴にスキャンしており、JS文字列リテラル
 * の中にあってもスラッシュ+アスタリスクの並びが現れるとコメント開始と
 * みなし、次に見つかるアスタリスク+スラッシュまでの内容を丸ごと消して
 * しまう。例: accept="image/(アスタリスク)" のせいで9000文字超が消え、
 * appjs4.htmlの末尾でSyntaxErrorになった。
 * 対策: appjs1〜4.html内ではスラッシュ+アスタリスクの並びをリテラルで
 * 書かない(例: 'image/'+'*' のように分割する)。
 */
function getAppBundle() {
  var files = ['appjs1', 'appjs2', 'appjs3', 'appjs4'];
  var code = files.map(function(name) {
    var raw = HtmlService.createHtmlOutputFromFile(name).getContent();
    // 各ファイルは HtmlService.createHtmlOutputFromFile() が
    // 「HTMLとして妥当な内容」を要求するために <script>タグで
    // 包んであるが、ここではDOM要素へ直接注入する生JSとして
    // 使うため、外側のタグだけ取り除く。
    return raw.replace(/^\s*<script>/i, '').replace(/<\/script>\s*$/i, '');
  }).join('\n');
  // 保存データはここに含めない（クライアントが loadData() で別途取得）。
  // 実データの多い本番環境で、コード＋データを1回の応答に載せると
  // 起動が失敗し画面が空白になったため（2026-09-29）。
  // 受信側で「サーバーが送った文字数」と「実際に届いた文字数」を
  // 比較できるよう、簡易チェックサム(文字数の合計コード値の下32bit)
  // も一緒に返す。転送中の破損を切り分けるための診断用。
  var checksum = 0;
  for (var i = 0; i < code.length; i++) {
    checksum = (checksum + code.charCodeAt(i) * (i % 97 + 1)) % 2147483647;
  }
  return { code: code, data: null,
           expectedLength: code.length, expectedChecksum: checksum };
}

/**
 * index.html から <?!= include('styles'); ?> のように呼び出し、
 * styles.html(CSS) / app.html(エラー診断スクリプト)を結合して
 * レンダリングするためのヘルパー。
 * （HTML Service はファイル分割時にこの仕組みが必要）
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ============================================================
   DATA PERSISTENCE
============================================================ */
function loadData() {
  return PropertiesService.getScriptProperties().getProperty('sinntyoku_state') || null;
}

function saveData(stateJson) {
  PropertiesService.getScriptProperties().setProperty('sinntyoku_state', stateJson);
}

/* ============================================================
   EXTERNAL LINKAGE
============================================================ */
function getLinkageData(url) {
  if (!url) return null;
  try {
    var sep = url.indexOf('?') >= 0 ? '&' : '?';
    var fetchUrl = url + sep + 'action=getForLink';
    // ドメイン内ユーザー制限のGASにはOAuthトークンを付与して認証
    var token = ScriptApp.getOAuthToken();
    var res = UrlFetchApp.fetch(fetchUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'Authorization': 'Bearer ' + token },
    });
    var code = res.getResponseCode();
    var body = res.getContentText();

    if (code === 200) {
      // レスポンスがJSONか確認
      try {
        JSON.parse(body);
        return body;
      } catch(e) {
        // HTMLが返ってきた場合（ログインページなど）
        return JSON.stringify({
          __error: true,
          code: code,
          message: 'レスポンスがJSONではありません。ログインページにリダイレクトされた可能性があります。',
          hint: 'GASのデプロイ設定を「全員（匿名ユーザーを含む）」に変更してください。',
          bodyExcerpt: body.substring(0, 200),
        });
      }
    }

    Logger.log('getLinkageData HTTP ' + code + ': ' + body.substring(0, 200));
    return JSON.stringify({
      __error: true,
      code: code,
      message: 'HTTPエラー: ' + code,
      hint: code === 401 || code === 302
        ? 'OAuthトークンを送信しましたが認証に失敗しました。①進捗管理GASの「サービス」に外部サービスが承認されているか確認 ②見積管理GASのデプロイ実行ユーザーが「自分」になっているか確認してください。'
        : code === 404 ? 'URLが見つかりません。デプロイURLを確認してください。'
        : 'URLまたはデプロイ設定を確認してください。',
      bodyExcerpt: body.substring(0, 200),
    });
  } catch (e) {
    Logger.log('getLinkageData error: ' + e.message);
    return JSON.stringify({
      __error: true,
      code: 0,
      message: 'ネットワークエラー: ' + e.message,
      hint: 'URLの形式を確認してください。',
    });
  }
}

/* ============================================================
   GOOGLE CALENDAR EXPORT
============================================================ */
/**
 * マイルストーン日程をGoogleカレンダーに登録
 * @param {string} machineId - 機種名
 * @param {string} eventsJson - [{title,date,description,emailDays,icon}]
 * @param {string} calendarId - カレンダーID（空=デフォルト）
 */
function createMilestoneCalendarEvents(machineId, eventsJson, calendarId) {
  try {
    var events = JSON.parse(eventsJson);
    var cal = (calendarId && calendarId.trim())
      ? CalendarApp.getCalendarById(calendarId.trim())
      : CalendarApp.getDefaultCalendar();

    if (!cal) return JSON.stringify({ success: false, error: 'カレンダーが見つかりません。IDを確認してください。' });

    var results = [];
    events.forEach(function(ev) {
      var parts = ev.date.split('-');
      var d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
      var gcEvent = cal.createAllDayEvent(ev.title, d, {
        description: ev.description || '',
      });
      // メールリマインダー（N日前）
      var emailDays = parseInt(ev.emailDays) || 7;
      try { gcEvent.addEmailReminder(emailDays * 24 * 60); } catch(e){}
      // ポップアップリマインダー（1日前）
      try { gcEvent.addPopupReminder(24 * 60); } catch(e){}
      results.push({ title: ev.title, date: ev.date });
    });

    return JSON.stringify({
      success: true,
      created: results.length,
      calendar: cal.getName(),
    });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.message });
  }
}

/* ============================================================
   DRIVE FILE UPLOAD
============================================================ */
function uploadFileToDrive(fileName, base64Data, mimeType, machineId) {
  try {
    var FOLDER_NAME = '営業進捗管理_添付ファイル';
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    var rootFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);

    var machineFolders = rootFolder.getFoldersByName(machineId);
    var machineFolder = machineFolders.hasNext() ? machineFolders.next() : rootFolder.createFolder(machineId);

    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var file = machineFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
      uploadedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
    });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.message });
  }
}

/**
 * 方法②: スプレッドシートIDで直接読み込み（見積管理GASが不要）
 * 管理コンソールの「スプレッドシートID」欄にIDを入力して使う
 * シート列名は linkage-helper.gs の LINKAGE_CONFIG.columns と同じ
 */
function getLinkageDataFromSheet(spreadsheetId, sheetName) {
  if (!spreadsheetId) return null;
  try {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getActiveSheet();
    if (!sheet) return JSON.stringify({ __error: true, code: 0, message: 'シートが見つかりません: ' + sheetName });

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return JSON.stringify({ estimates: [], total: 0 });

    var headers = data[0].map(function(h){ return String(h).trim(); });

    // 列インデックスを探す（linkage-helper.gs と同じロジック）
    var COL_CANDIDATES = {
      machineId: ['機種名','機種コード','モデル','id','machineId'],
      customer:  ['顧客名','得意先','お客様','宛先（企業名）','宛先','client','customer'],
      amount:    ['見積金額','金額','受注金額','amount'],
      status:    ['ステータス','状態','status'],
      quoteDate: ['見積提出日','見積日','提出日','発行日','quoteDate'],
      poDate:    ['注文書受領日','注文書日','受領日','poDate','orderDate'],
      // 「見積台帳」シートは見積書PDFのリンクを「保存先URL」列に持つ
      url:       ['見積書URL','見積リンク','見積PDF','保存先URL','URL','リンク','url','link'],
      orderUrl:  ['注文書URL','注文書リンク','注文書PDF','orderUrl','orderLink','po_url'],
      orderNo:   ['注文番号','注文書番号','PO番号','orderNo'],
      quoteNo:   ['見積番号','見積No.','見積No','quoteNo'],
      memo:      ['備考','メモ','note','memo'],
    };
    var colIdx = {};
    Object.keys(COL_CANDIDATES).forEach(function(field) {
      colIdx[field] = -1;
      COL_CANDIDATES[field].forEach(function(c) {
        if (colIdx[field] < 0) {
          var i = headers.indexOf(c);
          if (i >= 0) colIdx[field] = i;
        }
      });
    });

    var QUOTE_DONE = ['見積提出済','提出済','見積済','商談中','受注','注文書受領','完了'];
    var PO_DONE    = ['注文書受領','受注','注文書受領済','注文確定','完了'];

    var estimates = [];
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var mid = colIdx.machineId >= 0 ? String(row[colIdx.machineId]||'').trim() : '';
      if (!mid) continue;
      var status = String(colIdx.status >= 0 ? row[colIdx.status]||'' : '');
      var qDate = colIdx.quoteDate >= 0 ? _fmtCellDate(row[colIdx.quoteDate]) : '';
      var pDate = colIdx.poDate    >= 0 ? _fmtCellDate(row[colIdx.poDate])    : '';
      estimates.push({
        id: mid, machineId: mid,
        customer: colIdx.customer >= 0 ? String(row[colIdx.customer]||'') : '',
        amount:   colIdx.amount   >= 0 ? (parseFloat(String(row[colIdx.amount]||'').replace(/[^\d.]/g,''))||0) : 0,
        status:   status,
        quoteSubmitted: !!(qDate || QUOTE_DONE.some(function(s){return status.indexOf(s)>=0;})),
        quoteDate: qDate,
        poReceived: !!(pDate || PO_DONE.some(function(s){return status.indexOf(s)>=0;})),
        poDate: pDate,
        url:      colIdx.url      >= 0 ? String(row[colIdx.url]||'')      : '',
        orderUrl: colIdx.orderUrl >= 0 ? String(row[colIdx.orderUrl]||'') : '',
        orderNo:  colIdx.orderNo  >= 0 ? String(row[colIdx.orderNo]||'')  : '',
        quoteNo:  colIdx.quoteNo  >= 0 ? String(row[colIdx.quoteNo]||'')  : '',
        memo:     colIdx.memo     >= 0 ? String(row[colIdx.memo]||'')     : '',
        rowIndex: r + 1,
      });
    }
    return JSON.stringify({ estimates: estimates, total: estimates.length, updatedAt: new Date().toISOString(), sheetName: sheet.getName() });
  } catch (e) {
    return JSON.stringify({ __error: true, code: 0, message: e.message,
      hint: 'スプレッドシートIDを確認するか、このGASアカウントにシートの閲覧権限があるか確認してください。' });
  }
}

/* ============================================================
   SPREADSHEET → MACHINES AUTO SYNC
============================================================ */
function syncMachinesFromSheet(spreadsheetId, sheetName) {
  if (!spreadsheetId) return JSON.stringify({ __error: true, message: 'スプレッドシートIDが未指定です' });
  try {
    var ss = SpreadsheetApp.openById(spreadsheetId.trim());
    var sheet;
    if (sheetName && sheetName.trim()) {
      sheet = ss.getSheetByName(sheetName.trim());
    } else {
      // gid指定がある場合は全シートから探す
      sheet = ss.getActiveSheet();
    }
    if (!sheet) return JSON.stringify({ __error: true, message: 'シートが見つかりません: ' + (sheetName || '(default)') });

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return JSON.stringify({ __error: true, message: 'データが2行未満です' });

    var headers = data[0].map(function(h){ return String(h).trim(); });

    var COL = {
      id:           ['機種名','機種ID','機種コード','型式','モデル','id','machineId'],
      person:       ['担当者','担当','営業担当','person'],
      compliance:   ['適合','適合状況','型式適合','compliance'],
      prodQty:      ['量産台数','台数','生産台数','数量','受注台数','受注数量','販売台数','販売数量','メーカー販売数','prodQty','qty'],
      rom:          ['ROM','ロム','rom','ROM種類'],
      status:       ['ステータス','状態','進捗','status'],
      sampleImpl:   ['見本機実装','見本実装','サンプル実装','sampleImpl'],
      sampleAssy:   ['見本機組立','見本組立','サンプル組立','sampleAssy'],
      sampleShip:   ['見本機出荷','見本出荷','サンプル出荷','sampleShip'],
      prodImpl:     ['量産実装','prodImpl'],
      prodAssy:     ['量産組立','prodAssy'],
      prodShip:     ['量産出荷','prodShip','出荷日','出荷予定'],
      boards:       ['基板','基板情報','boards','基板構成'],
      notes:        ['備考','メモ','notes','コメント'],
      goalDate:     ['初回納品日','ゴール','納品日','goalDate'],
    };

    var colIdx = {};
    Object.keys(COL).forEach(function(field) {
      colIdx[field] = -1;
      COL[field].forEach(function(c) {
        if (colIdx[field] < 0) {
          var i = headers.indexOf(c);
          if (i >= 0) colIdx[field] = i;
        }
      });
    });

    if (colIdx.id < 0) {
      return JSON.stringify({ __error: true, message: '機種名の列が見つかりません。ヘッダー行に「機種名」「機種ID」等の列名が必要です。\n検出されたヘッダー: ' + headers.join(', ') });
    }

    var machines = [];
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var mid = colIdx.id >= 0 ? String(row[colIdx.id] || '').trim() : '';
      if (!mid) continue;

      var m = {
        id: mid,
        person:     colIdx.person     >= 0 ? String(row[colIdx.person] || '')     : '',
        compliance: colIdx.compliance >= 0 ? String(row[colIdx.compliance] || '') : '',
        prodQty:    colIdx.prodQty    >= 0 ? String(row[colIdx.prodQty] || '')    : '',
        rom:        colIdx.rom        >= 0 ? String(row[colIdx.rom] || '')        : '',
        status:     colIdx.status     >= 0 ? String(row[colIdx.status] || '')     : '',
        sampleImpl: colIdx.sampleImpl >= 0 ? _fmtCellDate(row[colIdx.sampleImpl]) : '',
        sampleAssy: colIdx.sampleAssy >= 0 ? _fmtCellDate(row[colIdx.sampleAssy]) : '',
        sampleShip: colIdx.sampleShip >= 0 ? _fmtCellDate(row[colIdx.sampleShip]) : '',
        prodImpl:   colIdx.prodImpl   >= 0 ? _fmtCellDate(row[colIdx.prodImpl])   : '',
        prodAssy:   colIdx.prodAssy   >= 0 ? _fmtCellDate(row[colIdx.prodAssy])   : '',
        prodShip:   colIdx.prodShip   >= 0 ? _fmtCellDate(row[colIdx.prodShip])   : '',
        notes:      colIdx.notes      >= 0 ? String(row[colIdx.notes] || '')      : '',
        boards:     colIdx.boards     >= 0 ? String(row[colIdx.boards] || '')     : '',
        goalDate:   colIdx.goalDate   >= 0 ? _fmtCellDate(row[colIdx.goalDate])   : '',
        rowIndex: r + 1,
      };
      machines.push(m);
    }

    return JSON.stringify({
      success: true,
      machines: machines,
      total: machines.length,
      sheetName: sheet.getName(),
      detectedColumns: Object.keys(colIdx).filter(function(k){ return colIdx[k] >= 0; }),
      headers: headers,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return JSON.stringify({ __error: true, message: e.message,
      hint: 'スプレッドシートIDを確認するか、このGASアカウントにシートの閲覧権限があるか確認してください。' });
  }
}

/* ============================================================
   受注状況シート → 販売台数の自動反映（トリガーで定期実行）
   毎回ブラウザを開かなくても、指定シートの最新の販売台数を
   保存データ（machineFields.prodQty）に直接書き込む。
============================================================ */

/**
 * [管理コンソールから呼び出し] 自動反映を有効化してトリガーを設定
 * @param {string} spreadsheetId - 受注状況シートのスプレッドシートID
 * @param {string} sheetName - シート名（例: 受注状況）
 * @param {number} intervalHours - 何時間ごとに反映するか（デフォルト1時間）
 */
function setupOrderSyncTrigger(spreadsheetId, sheetName, intervalHours) {
  if (!spreadsheetId) return JSON.stringify({ success: false, error: 'スプレッドシートIDが未指定です' });
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'autoSyncOrderStatus') ScriptApp.deleteTrigger(t);
  });
  var props = PropertiesService.getScriptProperties();
  props.setProperty('orderSync_spreadsheetId', spreadsheetId.trim());
  props.setProperty('orderSync_sheetName', (sheetName || '').trim());
  var hours = parseInt(intervalHours, 10) || 1;
  ScriptApp.newTrigger('autoSyncOrderStatus').timeBased().everyHours(hours).create();
  // 設定直後に一度実行して即時反映
  try { autoSyncOrderStatus(); } catch (e) { Logger.log('初回同期エラー: ' + e.message); }
  Logger.log('✅ 受注状況シート自動反映トリガーを設定しました（' + hours + '時間ごと）');
  return JSON.stringify({ success: true, hours: hours });
}

/** 自動反映を停止 */
function removeOrderSyncTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'autoSyncOrderStatus') ScriptApp.deleteTrigger(t);
  });
  return JSON.stringify({ success: true });
}

/** 現在の自動反映設定を確認 */
function getOrderSyncStatus() {
  var props = PropertiesService.getScriptProperties();
  var active = ScriptApp.getProjectTriggers().some(function(t) {
    return t.getHandlerFunction() === 'autoSyncOrderStatus';
  });
  return JSON.stringify({
    active: active,
    spreadsheetId: props.getProperty('orderSync_spreadsheetId') || '',
    sheetName: props.getProperty('orderSync_sheetName') || '',
  });
}

/**
 * [トリガーから定期実行 / 手動実行可] 受注状況シートの最新台数を
 * 保存済みstate（machineFields.prodQty）へ反映する。
 * ウェブアプリを開いていなくても、次に開いたときに最新値が表示される。
 */
function autoSyncOrderStatus() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty('orderSync_spreadsheetId');
  var sheetName = props.getProperty('orderSync_sheetName');
  if (!spreadsheetId) { Logger.log('受注状況シート未設定 — setupOrderSyncTrigger() で設定してください'); return; }

  var res = syncMachinesFromSheet(spreadsheetId, sheetName);
  var parsed;
  try { parsed = JSON.parse(res); } catch (e) { Logger.log('受注状況シート解析エラー: ' + e.message); return; }
  if (parsed.__error) { Logger.log('受注状況シート同期エラー: ' + parsed.message); return; }

  var stateJson = loadData();
  var state = stateJson ? JSON.parse(stateJson) : {};
  state.machineFields = state.machineFields || {};
  state.config = state.config || {};

  var updated = 0;
  (parsed.machines || []).forEach(function(sm) {
    if (!sm.id || !sm.prodQty) return;
    var f = state.machineFields[sm.id] || {};
    if (f.prodQty !== sm.prodQty) updated++;
    f.prodQty = sm.prodQty;
    state.machineFields[sm.id] = f;
  });

  state.config.lastOrderSyncAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  state.config.lastOrderSyncCount = updated;
  state.config.lastOrderSyncSheet = parsed.sheetName || sheetName || '';
  saveData(JSON.stringify(state));
  Logger.log('✅ 受注状況シート自動反映: ' + updated + '件更新（' + (parsed.sheetName || sheetName) + '）');
}

function _fmtCellDate(v) {
  if (!v) return '';
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var s = String(v).trim();
  return /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(s) ? s.substring(0,10).replace(/\//g,'-') : '';
}

/* ============================================================
   取込資料アーカイブ（お客様資料PDF・Excelの原本をDriveへ保存）
   生産計画PDF・ハードウェア構成一覧表などを取り込む際に、原本を
   「営業進捗管理_取込資料/<種別>」フォルダへ自動保存する。
   ※ CONFIDENTIAL資料を含むため、uploadFileToDrive() と違い
     「リンクを知っている全員」への共有設定は行わない（フォルダ権限を継承）。
============================================================ */
function archiveImportFile(fileName, base64Data, mimeType, category) {
  try {
    var ROOT_NAME = '営業進捗管理_取込資料';
    var roots = DriveApp.getFoldersByName(ROOT_NAME);
    var rootFolder = roots.hasNext() ? roots.next() : DriveApp.createFolder(ROOT_NAME);

    var catName = String(category || 'その他お客様資料').replace(/[\\\/:?"<>|]/g, '_');
    var cats = rootFolder.getFoldersByName(catName);
    var catFolder = cats.hasNext() ? cats.next() : rootFolder.createFolder(catName);

    var bytes = Utilities.base64Decode(base64Data);

    // 同名・同サイズのファイルが既にあれば二重保存せず既存を返す
    var same = catFolder.getFilesByName(fileName);
    while (same.hasNext()) {
      var f = same.next();
      if (!f.isTrashed() && f.getSize() === bytes.length) {
        return JSON.stringify({
          success: true, duplicate: true,
          fileId: f.getId(), fileName: fileName, url: f.getUrl(),
          folderUrl: catFolder.getUrl(),
          uploadedAt: Utilities.formatDate(f.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
        });
      }
    }

    var blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName);
    var file = catFolder.createFile(blob);
    return JSON.stringify({
      success: true, duplicate: false,
      fileId: file.getId(), fileName: fileName, url: file.getUrl(),
      folderUrl: catFolder.getUrl(),
      uploadedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
    });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.message });
  }
}

function deleteFileFromDrive(fileId) {
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
    return JSON.stringify({ success: true });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.message });
  }
}

/* ============================================================
   EMAIL NOTIFICATION
============================================================ */

/**
 * [クライアントから呼び出し] 重要変更時にアラートメールを送信
 * @param {string} stateJson - JSON.stringify(state)
 * @param {string} changeDesc - 変更内容の説明
 */
function sendAlertEmail(stateJson, changeDesc) {
  var state = _parseState(stateJson);
  if (!state) return;
  var email = _getNotifyEmail(state);
  if (!email) return;

  var alerts = _checkAlerts(state);
  // 変更内容があるか、アラートがある場合のみ送信
  if (!changeDesc && alerts.length === 0) return;

  MailApp.sendEmail({
    to: email,
    subject: '【営業進捗】' + (changeDesc || 'アラート通知') + ' ' + _fmtDate(new Date()),
    htmlBody: _buildAlertHtml(state, changeDesc, alerts),
  });
  Logger.log('アラートメール送信: ' + email + ' / ' + changeDesc);
}

/**
 * [GASタイマーから自動呼び出し] 毎日朝8時のサマリーメール
 * setupDailyTrigger() を一度実行してトリガーを設定してください
 */
function sendDailySummary() {
  var state = _parseState(loadData());
  if (!state) return;
  var email = _getNotifyEmail(state);
  if (!email) {
    Logger.log('通知先メールアドレス未設定 — 管理コンソールで設定してください');
    return;
  }

  MailApp.sendEmail({
    to: email,
    subject: '【営業進捗】日次サマリー ' + _fmtDate(new Date()),
    htmlBody: _buildDailySummaryHtml(state),
  });
  Logger.log('日次サマリーメール送信: ' + email);
}

/**
 * 毎日8時の自動トリガーをセットアップ
 * GASエディタの「実行」メニューから一度だけ手動実行してください
 */
function setupDailyTrigger() {
  // 既存トリガーをクリア
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendDailySummary') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('✅ 毎日8時トリガーを設定しました');
}

/** トリガーを削除（通知を停止したい場合） */
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendDailySummary') {
      ScriptApp.deleteTrigger(t);
      Logger.log('トリガーを削除しました');
    }
  });
}

/* ============================================================
   INTERNAL HELPERS
============================================================ */
function _parseState(json) {
  if (!json) return null;
  try { return typeof json === 'string' ? JSON.parse(json) : json; } catch(e) { return null; }
}

/** 複数メールアドレスに対応（カンマ区切り or 配列） */
function _getNotifyEmail(state) {
  if (!state.config) return '';
  // 新方式: notifyEmails は配列
  if (Array.isArray(state.config.notifyEmails) && state.config.notifyEmails.length > 0) {
    return state.config.notifyEmails.filter(function(e){ return e && e.trim(); }).join(',');
  }
  // 旧方式: notifyEmail は文字列
  return state.config.notifyEmail ? state.config.notifyEmail.trim() : '';
}

function _fmtDate(d) {
  return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
}

var _STAGE_LABELS = {
  collection:'回収', disassembly:'解体', e_inspect:'E基板検査',
  snb_inspect:'SNB基板検査', assembly:'組み立て', delivered:'納品完了',
};
var _PHASE_LABELS = {
  sampleShip:'見本機出荷', prodImpl:'量産実装',
  prodAssy:'量産組立', prodShip:'量産出荷',
};

function _checkAlerts(state) {
  var alerts = [];
  var today = new Date(); today.setHours(0,0,0,0);
  var ids = Object.keys(state.statuses || {});
  var nc = state.config && state.config.notifyCategories || {};
  // notifyCategories が未設定の場合はすべて有効
  var cat = function(key){ return nc[key] !== false; };

  // スケジュール警告（7日以内）
  if (cat('schedule')) {
    ids.forEach(function(id) {
      var sc = state.schedules && state.schedules[id];
      if (!sc) return;
      Object.keys(_PHASE_LABELS).forEach(function(key) {
        if (!sc[key]) return;
        var d = new Date(sc[key]); d.setHours(0,0,0,0);
        var diff = Math.ceil((d - today) / 86400000);
        if (diff >= 0 && diff <= 7) {
          alerts.push({type:'schedule', id:id, label:_PHASE_LABELS[key], date:sc[key], diff:diff});
        }
      });
    });
  }

  // エコ滞留警告
  if (cat('eco')) {
    var threshold = (state.config && state.config.notifyThreshold) || 50;
    if (state.eco) {
      Object.keys(state.eco).forEach(function(machineId) {
        var eco = state.eco[machineId] || {};
        Object.keys(eco).forEach(function(stage) {
          if (stage !== 'delivered' && (eco[stage] || 0) >= threshold) {
            alerts.push({type:'eco', id:machineId, stage:stage, qty:eco[stage]});
          }
        });
      });
    }
  }

  // マイルストーン警告（見積提出・注文書受領）
  if (cat('milestone')) {
    _checkMilestoneAlerts(state, alerts);
  }

  return alerts;
}

function _buildDailySummaryHtml(state) {
  var today = new Date();
  var alerts = _checkAlerts(state);
  var ids = Object.keys(state.statuses || {});

  var cnt = {量産前:0, 量産中:0, 量産終了:0};
  ids.forEach(function(id) { var s = state.statuses[id]; if (cnt[s] !== undefined) cnt[s]++; });

  var ecoTotal = 0;
  if (state.eco) {
    Object.values(state.eco).forEach(function(eco) {
      Object.keys(eco).forEach(function(k) { if (k !== 'delivered') ecoTotal += (eco[k]||0); });
    });
  }

  var schedAlerts = alerts.filter(function(a){return a.type==='schedule';});
  var ecoAlerts   = alerts.filter(function(a){return a.type==='eco';});
  var msAlerts    = alerts.filter(function(a){return a.type==='milestone';});

  var schedRows = schedAlerts.map(function(a) {
    return '<tr>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;">' + a.id + '</td>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;">' + a.label + '</td>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-family:monospace;">' + a.date + '</td>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-weight:700;color:' +
        (a.diff===0?'#dc2626':a.diff<=3?'#d97706':'#2563eb') + ';">' +
        (a.diff===0?'🔴 本日':a.diff<=3?'🟠 '+a.diff+'日後':'🔵 '+a.diff+'日後') + '</td>' +
    '</tr>';
  }).join('');

  var ecoRows = ecoAlerts.map(function(a) {
    return '<tr>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;">' + a.id + '</td>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;">' + (_STAGE_LABELS[a.stage]||a.stage) + '</td>' +
      '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-weight:700;color:#2563eb;">' + a.qty + '台</td>' +
    '</tr>';
  }).join('');

  var appUrl = (state.config && state.config.appUrl) || '';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:sans-serif;">' +
    '<div style="max-width:600px;margin:24px auto;">' +
    // Header
    '<div style="background:#0f1729;padding:20px 24px;border-radius:10px 10px 0 0;">' +
      '<div style="font-size:16px;font-weight:700;color:#fff;">📊 営業進捗管理システム</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:4px;">日次サマリー — ' + _fmtDate(today) + '</div>' +
    '</div>' +
    // Summary cards
    '<div style="background:#fff;padding:20px 24px;border-left:1px solid #e8eaed;border-right:1px solid #e8eaed;">' +
      '<table style="width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:20px;"><tr>' +
        '<td style="background:#eff6ff;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:26px;font-weight:700;color:#2563eb;">' + cnt['量産中'] + '</div><div style="font-size:10px;color:#64748b;">量産中</div></td>' +
        '<td style="background:#fffbeb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:26px;font-weight:700;color:#d97706;">' + cnt['量産前'] + '</div><div style="font-size:10px;color:#64748b;">量産前</div></td>' +
        '<td style="background:#f0fdf4;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:26px;font-weight:700;color:#16a34a;">' + cnt['量産終了'] + '</div><div style="font-size:10px;color:#64748b;">量産終了</div></td>' +
        '<td style="background:#f0f9ff;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:26px;font-weight:700;color:#0891b2;">' + ecoTotal + '</div><div style="font-size:10px;color:#64748b;">エコ処理中</div></td>' +
      '</tr></table>' +
      // Schedule alerts
      (schedAlerts.length > 0 ?
        '<div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:8px;">⚠️ 直近7日スケジュール警告 (' + schedAlerts.length + '件)</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;">' +
          '<tr style="background:#f8fafc;"><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">機種</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">工程</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">日程</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">残り</th></tr>' +
          schedRows +
        '</table>'
        : '<p style="color:#16a34a;font-size:13px;margin-bottom:20px;">✅ 直近7日以内のスケジュール警告なし</p>'
      ) +
      // ECO alerts
      (ecoAlerts.length > 0 ?
        '<div style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:8px;">⚠️ エコフロー滞留警告 (' + ecoAlerts.length + '件)</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;">' +
          '<tr style="background:#f8fafc;"><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">機種</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">工程</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">滞留台数</th></tr>' +
          ecoRows +
        '</table>'
        : ''
      ) +
      // Milestone alerts
      (msAlerts.length > 0 ?
        '<div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:8px;">🚨 見積・注文書 期限アラート (' + msAlerts.length + '件)</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;">' +
          '<tr style="background:#f8fafc;"><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">機種</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">項目</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">期限</th><th style="padding:6px 12px;text-align:left;font-size:11px;border-bottom:2px solid #e8eaed;">状況</th></tr>' +
          msAlerts.map(function(a){
            return '<tr>' +
              '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-weight:700;">' + a.id + '</td>' +
              '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;">' + a.label + '</td>' +
              '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-family:monospace;">' + a.deadline + '</td>' +
              '<td style="padding:7px 12px;border-bottom:1px solid #e8eaed;font-weight:700;color:' + (a.urgent?'#dc2626':'#d97706') + ';">' +
                (a.urgent ? '🔴 '+Math.abs(a.diff)+'日超過' : '⚠️ あと'+a.diff+'日') +
              '</td></tr>';
          }).join('') +
        '</table>'
        : ''
      ) +
    '</div>' +
    // Footer
    '<div style="background:#f8fafc;padding:12px 24px;border-radius:0 0 10px 10px;border:1px solid #e8eaed;border-top:none;">' +
      '<p style="margin:0;font-size:11px;color:#94a3b8;">自動送信メール — 返信不要' +
        (appUrl ? ' | <a href="' + appUrl + '" style="color:#2563eb;">システムを開く</a>' : '') +
      '</p>' +
    '</div></div></body></html>';
}

function _buildAlertHtml(state, changeDesc, alerts) {
  // サマリーHTMLのヘッダーを変更して再利用
  return _buildDailySummaryHtml(state)
    .replace('日次サマリー', '更新通知: ' + (changeDesc||'変更あり'));
}

/* ============================================================
   マイルストーン アラート拡張（_checkAlerts に統合）
   ※ _checkAlerts 内の return alerts; の前に呼ぶ
   ============================================================ */
function _checkMilestoneAlerts(state, alerts) {
  var today = new Date(); today.setHours(0,0,0,0);
  var ms = state.milestones || {};

  Object.keys(ms).forEach(function(machineId) {
    var m = ms[machineId];
    if (!m || !m.goalDate) return;

    var goalD = new Date(m.goalDate); goalD.setHours(0,0,0,0);
    var qLead = m.quoteLeadDays || 60;
    var pLead = m.poLeadDays    || 30;

    var qDeadline = new Date(goalD); qDeadline.setDate(qDeadline.getDate() - qLead);
    var pDeadline = new Date(goalD); pDeadline.setDate(pDeadline.getDate() - pLead);

    var quoteOk = m.quoteSubmitted || false;
    var poOk    = m.poReceived     || false;

    var qDiff = Math.ceil((qDeadline - today) / 86400000);
    var pDiff = Math.ceil((pDeadline - today) / 86400000);

    // 14日以内 or 超過
    if (!quoteOk && qDiff <= 14) {
      alerts.push({
        type: 'milestone', subtype: 'quote',
        id: machineId, label: '見積書未提出',
        deadline: Utilities.formatDate(qDeadline, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        diff: qDiff, urgent: qDiff <= 0,
      });
    }
    if (!poOk && pDiff <= 14) {
      alerts.push({
        type: 'milestone', subtype: 'po',
        id: machineId, label: '注文書未受領',
        deadline: Utilities.formatDate(pDeadline, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        diff: pDiff, urgent: pDiff <= 0,
      });
    }
  });
  return alerts;
}
