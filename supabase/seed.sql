-- Seed the outcomes pool. Run after 0001_init.sql.
-- Weight controls relative probability (higher = more likely).

insert into public.outcomes (type, title, description, weight) values
  ('reward',     'Jackpot!',          'You win the round. Take a bow. 🎉',                       2),
  ('reward',     'Lucky Strike',      'Skip the next player — they lose their turn.',            3),
  ('reward',     'Double Up',         'Your next reward counts twice.',                          2),
  ('reward',     'Safe Pass',         'Immunity: ignore the next punishment you would draw.',    3),
  ('reward',     'Crowd Favorite',    'Everyone owes you a high five. Nice.',                    4),
  ('punishment', 'Sing a Song',       'Perform a 10-second song for the group. 🎤',              4),
  ('punishment', 'Truth Time',        'Answer one question from the player on your left.',        4),
  ('punishment', 'Freeze',           'Skip your next turn.',                                     3),
  ('punishment', 'Tongue Twister',    'Say "she sells seashells" three times fast.',             3),
  ('punishment', 'Mini Dare',         'The group picks a small harmless dare for you.',           2),
  ('leave',      'Eliminated!',       'Bad luck — you are out of the game. 💀',                  2),
  ('leave',      'Trap Door',         'The floor opens. You leave the game.',                    1);
