-- ============================================================
-- ПОЛНЫЙ АУДИТ одним запросом — для Supabase SQL Editor.
-- Вставить целиком → Run → прислать таблицу результата.
-- Только чтение (SELECT), ничего не меняет.
-- ============================================================
with s as (
  select 'A. Котиков всего' section, count(*)::text value, 'с рекордом: '||count(*) filter (where "bestScore">0)::text||' · без забегов: '||count(*) filter (where "bestScore"=0)::text detail from "LeaderPlayer"
  union all select 'B. Максимум очков', max("bestScore")::text, 'у «'||(select nick from "LeaderPlayer" order by "bestScore" desc limit 1)||'»' from "LeaderPlayer"
  union all select 'C. Нарушений потолка очков', count(*)::text, 'норма = 0 (потолок 15000+10000×ур.)' from "LeaderPlayer" where "bestScore" > 15000 + "bestLevel"*10000
  union all select 'D. Дублей ников', count(*)::text, '' from (select lower(trim(nick)) from "LeaderPlayer" group by 1 having count(*)>1) t
  union all select 'E. Забегов в журнале', count(*)::text, 'устройств: '||count(distinct device)::text from "LeaderSubmission"
  union all select 'F. Дрейф рекорда', count(*)::text, 'норма: 0 у игроков, bestScore>0' from "LeaderPlayer" p where p."bestScore" <> coalesce((select max(score) from "LeaderSubmission" s where s.device=p.device),0)
  union all select 'G. Бурсты >18 заб/час', count(*)::text, '' from (select device, date_trunc('hour',"createdAt") h from "LeaderSubmission" group by 1,2 having count(*)>18) t
  union all select 'H. Забегов <15 сек зачтено', count(*)::text, 'норма = 0' from "LeaderRun" where status='submitted' and "endedAt"-"startedAt" < interval '15 seconds'
  union all select 'I. Выше потолка в журнале', count(*)::text, 'норма = 0' from "LeaderSubmission" where score > 15000 + level*10000
  union all select 'J. Статусы забегов', count(*)::text, 'open='||count(*) filter (where status='open')||' · submitted='||count(*) filter (where status='submitted')||' · expired='||count(*) filter (where status='expired') from "LeaderRun"
  union all select 'K. Висячих open >3ч', count(*)::text, 'утёкшие nonce — не опасно' from "LeaderRun" where status='open' and "startedAt" < now() - interval '3 hours'
  union all select 'L. Счётчики мира', '', 'launches='||coalesce((select value::text from "LeaderStat" where key='launches'),'0')||' · runs='||coalesce((select value::text from "LeaderStat" where key='runs'),'0')||' · playsecs='||coalesce((select value::text from "LeaderStat" where key='playsecs'),'0')
  union all select 'M. Посетителей', count(*)::text, '' from "LeaderVisit"
  union all select 'N. Кото-лут: слуг двора', count(*)::text, 'топ волна: '||coalesce(max(wave),0)::text||' · боссов: '||coalesce(sum(bosses),0)::text from "KotoLeader"
  union all select 'O. Кото-лут: дублей имён', count(*)::text, '' from (select name from "KotoLeader" group by name having count(*)>1) t
  union all select 'P. Кото-лут: висячих open >7сут', count(*)::text, '' from "KotoRun" where status='open' and "startedAt" < now() - interval '7 days'
)
select section, value, detail from s order by section;
