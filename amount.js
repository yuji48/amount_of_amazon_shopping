(function(){
	var total = {};
	var date = new Date();
	var year = date.getFullYear();
	var all = false;
	function init(num) {
		if(typeof num !== 'number') {
			num = 0;
			$('<div/>').css({
				position: 'fixed',
				left: 0,
				top: 0,
				width: '100%',
				height: '100%',
				zIndex: 1000,
				backgroundColor: 'rgba(0,0,0,.7)',
				color: '#fff',
				fontSize: 30,
				textAlign: 'center',
				paddingTop: '15em'
			}).attr('id', '___overlay').text('Amazonいくら使った？').appendTo('body');
			year = window.prompt('西暦何年の注文を集計しますか？\n半角数字4桁で入力してください\n（全期間を集計する場合は「all」と入力）', year);
			if(year === 'all') {
				all = true;
				year = $('#orderFilter option:last').val().match(/[0-9]/g).join('');
			} else if(!/^[0-9]{4}$/.test(year)) {
				alert('正しい数値を入力してください');
				$('#___overlay').remove();
				return false;
			}
			year = Number(year);
			total[year] = 0;
		}
		var progress = load(num);
		$('#___overlay').text(year+'年の集計中…  / '+(num+1)+'ページ目');
		progress.done(function(price){
			total[year] += price;
			init(num+1);
		}).fail(function(){
			if(all && new Date().getFullYear() > year) {
				year++;
				total[year] = 0;
				init(0);
			} else {
				var txt = 'あなたは\n';
				var _total = 0;
				$.each(total, function(year, yen){
					txt += year + '年 合計' + addFigure(yen) + '円分\n';
					_total += yen;
				});
				if(all) txt += '総計' + addFigure(_total) + '円分\n';
				alert(txt + 'の買い物をAmazonでしました！');
				$('#___overlay').remove();
			}
		});
	}

	function load(num) {
		var df = $.Deferred();
		var page = get(num);
		page.done(function(data){
			var dom = $.parseHTML(data);
			var _total = 0;
			$(dom).find('.price').each(function(){
				_total += (Number($(this).text().match(/[0-9]/g).join('')));
			});
			if(_total === 0) df.reject();
			else df.resolve(_total);
		});
		return df.promise();
	}

	function get(num) {
		var df = $.Deferred();
		$.ajax({
			url: 'https://www.amazon.co.jp/gp/css/order-history/?orderFilter=year-'+year+'&startIndex='+num*10,
			success: function(data){
				df.resolve(data);
			}
		});
		return df.promise();
	}

	function addFigure(str) {
		var num = new String(str).replace(/,/g, "");
		while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		return num;
	}

	if(typeof $ !== 'function') {
		var d=document;
		var s=d.createElement('script');
		s.src='//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
		s.onload=init;
		d.body.appendChild(s);
	} else {
		init();
	}
})();
