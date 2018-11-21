const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('../app/errors'),
  testHelpers = require('./testHelpers'),
  nock = require('nock'),
  errorMessages = require('../app/errors').errorMessages;

chai.use(chaiSubset);

const albums = [
  {
    userId: 1,
    id: 1,
    title: 'quidem molestiae enim'
  },
  {
    userId: 1,
    id: 2,
    title: 'sunt qui excepturi placeat culpa'
  },
  {
    userId: 1,
    id: 3,
    title: 'omnis laborum odio'
  },
  {
    userId: 1,
    id: 4,
    title: 'non esse culpa molestiae omnis sed optio'
  },
  {
    userId: 1,
    id: 5,
    title: 'eaque aut omnis a'
  },
  {
    userId: 1,
    id: 6,
    title: 'natus impedit quibusdam illo est'
  },
  {
    userId: 1,
    id: 7,
    title: 'quibusdam autem aliquid et et quia'
  },
  {
    userId: 1,
    id: 8,
    title: 'qui fuga est a eum'
  },
  {
    userId: 1,
    id: 9,
    title: 'saepe unde necessitatibus rem'
  },
  {
    userId: 1,
    id: 10,
    title: 'distinctio laborum qui'
  }
];

const albumsPhotos = [
  {
    albumId: 1,
    id: 1,
    title: 'accusamus beatae ad facilis cum similique qui sunt',
    url: 'https://via.placeholder.com/600/92c952',
    thumbnailUrl: 'https://via.placeholder.com/150/92c952'
  },
  {
    albumId: 1,
    id: 2,
    title: 'reprehenderit est deserunt velit ipsam',
    url: 'https://via.placeholder.com/600/771796',
    thumbnailUrl: 'https://via.placeholder.com/150/771796'
  },
  {
    albumId: 1,
    id: 3,
    title: 'officia porro iure quia iusto qui ipsa ut modi',
    url: 'https://via.placeholder.com/600/24f355',
    thumbnailUrl: 'https://via.placeholder.com/150/24f355'
  },
  {
    albumId: 1,
    id: 4,
    title: 'culpa odio esse rerum omnis laboriosam voluptate repudiandae',
    url: 'https://via.placeholder.com/600/d32776',
    thumbnailUrl: 'https://via.placeholder.com/150/d32776'
  },
  {
    albumId: 1,
    id: 5,
    title: 'natus nisi omnis corporis facere molestiae rerum in',
    url: 'https://via.placeholder.com/600/f66b97',
    thumbnailUrl: 'https://via.placeholder.com/150/f66b97'
  },
  {
    albumId: 1,
    id: 6,
    title: 'accusamus ea aliquid et amet sequi nemo',
    url: 'https://via.placeholder.com/600/56a8c2',
    thumbnailUrl: 'https://via.placeholder.com/150/56a8c2'
  },
  {
    albumId: 1,
    id: 7,
    title: 'officia delectus consequatur vero aut veniam explicabo molestias',
    url: 'https://via.placeholder.com/600/b0f7cc',
    thumbnailUrl: 'https://via.placeholder.com/150/b0f7cc'
  },
  {
    albumId: 1,
    id: 8,
    title: 'aut porro officiis laborum odit ea laudantium corporis',
    url: 'https://via.placeholder.com/600/54176f',
    thumbnailUrl: 'https://via.placeholder.com/150/54176f'
  },
  {
    albumId: 1,
    id: 9,
    title: 'qui eius qui autem sed',
    url: 'https://via.placeholder.com/600/51aa97',
    thumbnailUrl: 'https://via.placeholder.com/150/51aa97'
  },
  {
    albumId: 1,
    id: 10,
    title: 'beatae et provident et ut vel',
    url: 'https://via.placeholder.com/600/810b14',
    thumbnailUrl: 'https://via.placeholder.com/150/810b14'
  },
  {
    albumId: 1,
    id: 11,
    title: 'nihil at amet non hic quia qui',
    url: 'https://via.placeholder.com/600/1ee8a4',
    thumbnailUrl: 'https://via.placeholder.com/150/1ee8a4'
  },
  {
    albumId: 1,
    id: 12,
    title: 'mollitia soluta ut rerum eos aliquam consequatur perspiciatis maiores',
    url: 'https://via.placeholder.com/600/66b7d2',
    thumbnailUrl: 'https://via.placeholder.com/150/66b7d2'
  },
  {
    albumId: 1,
    id: 13,
    title: 'repudiandae iusto deleniti rerum',
    url: 'https://via.placeholder.com/600/197d29',
    thumbnailUrl: 'https://via.placeholder.com/150/197d29'
  },
  {
    albumId: 1,
    id: 14,
    title: 'est necessitatibus architecto ut laborum',
    url: 'https://via.placeholder.com/600/61a65',
    thumbnailUrl: 'https://via.placeholder.com/150/61a65'
  },
  {
    albumId: 1,
    id: 15,
    title: 'harum dicta similique quis dolore earum ex qui',
    url: 'https://via.placeholder.com/600/f9cee5',
    thumbnailUrl: 'https://via.placeholder.com/150/f9cee5'
  },
  {
    albumId: 1,
    id: 16,
    title: 'iusto sunt nobis quasi veritatis quas expedita voluptatum deserunt',
    url: 'https://via.placeholder.com/600/fdf73e',
    thumbnailUrl: 'https://via.placeholder.com/150/fdf73e'
  },
  {
    albumId: 1,
    id: 17,
    title: 'natus doloribus necessitatibus ipsa',
    url: 'https://via.placeholder.com/600/9c184f',
    thumbnailUrl: 'https://via.placeholder.com/150/9c184f'
  },
  {
    albumId: 1,
    id: 18,
    title: 'laboriosam odit nam necessitatibus et illum dolores reiciendis',
    url: 'https://via.placeholder.com/600/1fe46f',
    thumbnailUrl: 'https://via.placeholder.com/150/1fe46f'
  },
  {
    albumId: 1,
    id: 19,
    title: 'perferendis nesciunt eveniet et optio a',
    url: 'https://via.placeholder.com/600/56acb2',
    thumbnailUrl: 'https://via.placeholder.com/150/56acb2'
  },
  {
    albumId: 1,
    id: 20,
    title: 'assumenda voluptatem laboriosam enim consequatur veniam placeat reiciendis error',
    url: 'https://via.placeholder.com/600/8985dc',
    thumbnailUrl: 'https://via.placeholder.com/150/8985dc'
  },
  {
    albumId: 1,
    id: 21,
    title: 'ad et natus qui',
    url: 'https://via.placeholder.com/600/5e12c6',
    thumbnailUrl: 'https://via.placeholder.com/150/5e12c6'
  },
  {
    albumId: 1,
    id: 22,
    title: 'et ea illo et sit voluptas animi blanditiis porro',
    url: 'https://via.placeholder.com/600/45601a',
    thumbnailUrl: 'https://via.placeholder.com/150/45601a'
  },
  {
    albumId: 1,
    id: 23,
    title: 'harum velit vero totam',
    url: 'https://via.placeholder.com/600/e924e6',
    thumbnailUrl: 'https://via.placeholder.com/150/e924e6'
  },
  {
    albumId: 1,
    id: 24,
    title: 'beatae officiis ut aut',
    url: 'https://via.placeholder.com/600/8f209a',
    thumbnailUrl: 'https://via.placeholder.com/150/8f209a'
  },
  {
    albumId: 1,
    id: 25,
    title: 'facere non quis fuga fugit vitae',
    url: 'https://via.placeholder.com/600/5e3a73',
    thumbnailUrl: 'https://via.placeholder.com/150/5e3a73'
  },
  {
    albumId: 1,
    id: 26,
    title: 'asperiores nobis voluptate qui',
    url: 'https://via.placeholder.com/600/474645',
    thumbnailUrl: 'https://via.placeholder.com/150/474645'
  },
  {
    albumId: 1,
    id: 27,
    title: 'sit asperiores est quos quis nisi veniam error',
    url: 'https://via.placeholder.com/600/c984bf',
    thumbnailUrl: 'https://via.placeholder.com/150/c984bf'
  },
  {
    albumId: 1,
    id: 28,
    title: 'non neque eligendi molestiae repudiandae illum voluptatem qui aut',
    url: 'https://via.placeholder.com/600/392537',
    thumbnailUrl: 'https://via.placeholder.com/150/392537'
  },
  {
    albumId: 1,
    id: 29,
    title: 'aut ipsam quos ab placeat omnis',
    url: 'https://via.placeholder.com/600/602b9e',
    thumbnailUrl: 'https://via.placeholder.com/150/602b9e'
  },
  {
    albumId: 1,
    id: 30,
    title: 'odio enim voluptatem quidem aut nihil illum',
    url: 'https://via.placeholder.com/600/372c93',
    thumbnailUrl: 'https://via.placeholder.com/150/372c93'
  },
  {
    albumId: 1,
    id: 31,
    title: 'voluptate voluptates sequi',
    url: 'https://via.placeholder.com/600/a7c272',
    thumbnailUrl: 'https://via.placeholder.com/150/a7c272'
  },
  {
    albumId: 1,
    id: 32,
    title: 'ad enim dignissimos voluptatem similique',
    url: 'https://via.placeholder.com/600/c70a4d',
    thumbnailUrl: 'https://via.placeholder.com/150/c70a4d'
  },
  {
    albumId: 1,
    id: 33,
    title: 'culpa ipsam nobis qui fuga magni et mollitia',
    url: 'https://via.placeholder.com/600/501fe1',
    thumbnailUrl: 'https://via.placeholder.com/150/501fe1'
  },
  {
    albumId: 1,
    id: 34,
    title: 'vitae est facere quia itaque adipisci perferendis id maiores',
    url: 'https://via.placeholder.com/600/35185e',
    thumbnailUrl: 'https://via.placeholder.com/150/35185e'
  },
  {
    albumId: 1,
    id: 35,
    title: 'tenetur minus voluptatum et',
    url: 'https://via.placeholder.com/600/c96cad',
    thumbnailUrl: 'https://via.placeholder.com/150/c96cad'
  },
  {
    albumId: 1,
    id: 36,
    title: 'expedita rerum eaque',
    url: 'https://via.placeholder.com/600/4d564d',
    thumbnailUrl: 'https://via.placeholder.com/150/4d564d'
  },
  {
    albumId: 1,
    id: 37,
    title: 'totam voluptas iusto deserunt dolores',
    url: 'https://via.placeholder.com/600/ea51da',
    thumbnailUrl: 'https://via.placeholder.com/150/ea51da'
  },
  {
    albumId: 1,
    id: 38,
    title: 'natus magnam iure rerum pariatur molestias dolore nisi',
    url: 'https://via.placeholder.com/600/4f5b8d',
    thumbnailUrl: 'https://via.placeholder.com/150/4f5b8d'
  },
  {
    albumId: 1,
    id: 39,
    title: 'molestiae nam ullam et rerum doloribus',
    url: 'https://via.placeholder.com/600/1e71a2',
    thumbnailUrl: 'https://via.placeholder.com/150/1e71a2'
  },
  {
    albumId: 1,
    id: 40,
    title: 'est quas voluptates dignissimos sint praesentium nisi recusandae',
    url: 'https://via.placeholder.com/600/3a0b95',
    thumbnailUrl: 'https://via.placeholder.com/150/3a0b95'
  },
  {
    albumId: 1,
    id: 41,
    title: 'in voluptatem doloremque cum atque architecto deleniti',
    url: 'https://via.placeholder.com/600/659403',
    thumbnailUrl: 'https://via.placeholder.com/150/659403'
  },
  {
    albumId: 1,
    id: 42,
    title: 'voluptatibus a autem molestias voluptas architecto culpa',
    url: 'https://via.placeholder.com/600/ca50ac',
    thumbnailUrl: 'https://via.placeholder.com/150/ca50ac'
  },
  {
    albumId: 1,
    id: 43,
    title: 'eius hic autem ad beatae voluptas',
    url: 'https://via.placeholder.com/600/6ad437',
    thumbnailUrl: 'https://via.placeholder.com/150/6ad437'
  },
  {
    albumId: 1,
    id: 44,
    title: 'neque eum provident et inventore sed ipsam dignissimos quo',
    url: 'https://via.placeholder.com/600/29fe9f',
    thumbnailUrl: 'https://via.placeholder.com/150/29fe9f'
  },
  {
    albumId: 1,
    id: 45,
    title: 'praesentium fugit quis aut voluptatum commodi dolore corrupti',
    url: 'https://via.placeholder.com/600/c4084a',
    thumbnailUrl: 'https://via.placeholder.com/150/c4084a'
  },
  {
    albumId: 1,
    id: 46,
    title: 'quidem maiores in quia fugit dolore explicabo occaecati',
    url: 'https://via.placeholder.com/600/e9b68',
    thumbnailUrl: 'https://via.placeholder.com/150/e9b68'
  },
  {
    albumId: 1,
    id: 47,
    title: 'et soluta est',
    url: 'https://via.placeholder.com/600/b4412f',
    thumbnailUrl: 'https://via.placeholder.com/150/b4412f'
  },
  {
    albumId: 1,
    id: 48,
    title: 'ut esse id',
    url: 'https://via.placeholder.com/600/68e0a8',
    thumbnailUrl: 'https://via.placeholder.com/150/68e0a8'
  },
  {
    albumId: 1,
    id: 49,
    title: 'quasi quae est modi quis quam in impedit',
    url: 'https://via.placeholder.com/600/2cd88b',
    thumbnailUrl: 'https://via.placeholder.com/150/2cd88b'
  },
  {
    albumId: 1,
    id: 50,
    title: 'et inventore quae ut tempore eius voluptatum',
    url: 'https://via.placeholder.com/600/9e59da',
    thumbnailUrl: 'https://via.placeholder.com/150/9e59da'
  },
  {
    albumId: 2,
    id: 51,
    title: 'non sunt voluptatem placeat consequuntur rem incidunt',
    url: 'https://via.placeholder.com/600/8e973b',
    thumbnailUrl: 'https://via.placeholder.com/150/8e973b'
  },
  {
    albumId: 2,
    id: 52,
    title: 'eveniet pariatur quia nobis reiciendis laboriosam ea',
    url: 'https://via.placeholder.com/600/121fa4',
    thumbnailUrl: 'https://via.placeholder.com/150/121fa4'
  },
  {
    albumId: 2,
    id: 53,
    title: 'soluta et harum aliquid officiis ab omnis consequatur',
    url: 'https://via.placeholder.com/600/6efc5f',
    thumbnailUrl: 'https://via.placeholder.com/150/6efc5f'
  },
  {
    albumId: 2,
    id: 54,
    title: 'ut ex quibusdam dolore mollitia',
    url: 'https://via.placeholder.com/600/aa8f2e',
    thumbnailUrl: 'https://via.placeholder.com/150/aa8f2e'
  },
  {
    albumId: 2,
    id: 55,
    title: 'voluptatem consequatur totam qui aut iure est vel',
    url: 'https://via.placeholder.com/600/5e04a4',
    thumbnailUrl: 'https://via.placeholder.com/150/5e04a4'
  },
  {
    albumId: 2,
    id: 56,
    title: 'vel voluptatem esse consequuntur est officia quo aut quisquam',
    url: 'https://via.placeholder.com/600/f9f067',
    thumbnailUrl: 'https://via.placeholder.com/150/f9f067'
  },
  {
    albumId: 2,
    id: 57,
    title: 'vero est optio expedita quis ut molestiae',
    url: 'https://via.placeholder.com/600/95acce',
    thumbnailUrl: 'https://via.placeholder.com/150/95acce'
  },
  {
    albumId: 2,
    id: 58,
    title: 'rem pariatur facere eaque',
    url: 'https://via.placeholder.com/600/cde4c1',
    thumbnailUrl: 'https://via.placeholder.com/150/cde4c1'
  },
  {
    albumId: 2,
    id: 59,
    title: 'modi totam dolor eaque et ipsum est cupiditate',
    url: 'https://via.placeholder.com/600/a46a91',
    thumbnailUrl: 'https://via.placeholder.com/150/a46a91'
  },
  {
    albumId: 2,
    id: 60,
    title: 'ea enim temporibus asperiores placeat consectetur commodi ullam',
    url: 'https://via.placeholder.com/600/323599',
    thumbnailUrl: 'https://via.placeholder.com/150/323599'
  },
  {
    albumId: 2,
    id: 61,
    title: 'quia minus sed eveniet accusantium incidunt beatae odio',
    url: 'https://via.placeholder.com/600/e403d1',
    thumbnailUrl: 'https://via.placeholder.com/150/e403d1'
  },
  {
    albumId: 2,
    id: 62,
    title: 'dolorem cumque quo nihil inventore enim',
    url: 'https://via.placeholder.com/600/65ad4f',
    thumbnailUrl: 'https://via.placeholder.com/150/65ad4f'
  },
  {
    albumId: 2,
    id: 63,
    title: 'facere animi autem quod dolor',
    url: 'https://via.placeholder.com/600/4e557c',
    thumbnailUrl: 'https://via.placeholder.com/150/4e557c'
  },
  {
    albumId: 2,
    id: 64,
    title: 'doloremque culpa quia',
    url: 'https://via.placeholder.com/600/cd5a92',
    thumbnailUrl: 'https://via.placeholder.com/150/cd5a92'
  },
  {
    albumId: 2,
    id: 65,
    title: 'sed voluptatum enim eaque cumque qui sunt',
    url: 'https://via.placeholder.com/600/149540',
    thumbnailUrl: 'https://via.placeholder.com/150/149540'
  },
  {
    albumId: 2,
    id: 66,
    title: 'provident rerum voluptatem illo asperiores qui maiores',
    url: 'https://via.placeholder.com/600/ee0a7e',
    thumbnailUrl: 'https://via.placeholder.com/150/ee0a7e'
  },
  {
    albumId: 2,
    id: 67,
    title: 'veritatis labore ipsum unde aut quam dolores',
    url: 'https://via.placeholder.com/600/1279e9',
    thumbnailUrl: 'https://via.placeholder.com/150/1279e9'
  },
  {
    albumId: 2,
    id: 68,
    title: 'architecto aut quod qui ullam vitae expedita delectus',
    url: 'https://via.placeholder.com/600/e9603b',
    thumbnailUrl: 'https://via.placeholder.com/150/e9603b'
  },
  {
    albumId: 2,
    id: 69,
    title: 'et autem dolores aut porro est qui',
    url: 'https://via.placeholder.com/600/46e3b1',
    thumbnailUrl: 'https://via.placeholder.com/150/46e3b1'
  },
  {
    albumId: 2,
    id: 70,
    title: 'quam quos dolor eum ea in',
    url: 'https://via.placeholder.com/600/7375af',
    thumbnailUrl: 'https://via.placeholder.com/150/7375af'
  },
  {
    albumId: 2,
    id: 71,
    title: 'illo qui vel laboriosam vel fugit deserunt',
    url: 'https://via.placeholder.com/600/363789',
    thumbnailUrl: 'https://via.placeholder.com/150/363789'
  },
  {
    albumId: 2,
    id: 72,
    title: 'iusto sint enim nesciunt facilis exercitationem',
    url: 'https://via.placeholder.com/600/45935c',
    thumbnailUrl: 'https://via.placeholder.com/150/45935c'
  },
  {
    albumId: 2,
    id: 73,
    title: 'rerum exercitationem libero dolor',
    url: 'https://via.placeholder.com/600/1224bd',
    thumbnailUrl: 'https://via.placeholder.com/150/1224bd'
  },
  {
    albumId: 2,
    id: 74,
    title: 'eligendi quas consequatur aut consequuntur',
    url: 'https://via.placeholder.com/600/65ac19',
    thumbnailUrl: 'https://via.placeholder.com/150/65ac19'
  },
  {
    albumId: 2,
    id: 75,
    title: 'aut magni quibusdam cupiditate ea',
    url: 'https://via.placeholder.com/600/a9ef52',
    thumbnailUrl: 'https://via.placeholder.com/150/a9ef52'
  },
  {
    albumId: 2,
    id: 76,
    title: 'magni nulla et dolores',
    url: 'https://via.placeholder.com/600/7644fe',
    thumbnailUrl: 'https://via.placeholder.com/150/7644fe'
  },
  {
    albumId: 2,
    id: 77,
    title: 'ipsum consequatur vel omnis mollitia repellat dolores quasi',
    url: 'https://via.placeholder.com/600/36d137',
    thumbnailUrl: 'https://via.placeholder.com/150/36d137'
  },
  {
    albumId: 2,
    id: 78,
    title: 'aperiam aut est amet tenetur et dolorem',
    url: 'https://via.placeholder.com/600/637984',
    thumbnailUrl: 'https://via.placeholder.com/150/637984'
  },
  {
    albumId: 2,
    id: 79,
    title: 'est vel et laboriosam quo aspernatur distinctio molestiae',
    url: 'https://via.placeholder.com/600/c611a9',
    thumbnailUrl: 'https://via.placeholder.com/150/c611a9'
  },
  {
    albumId: 2,
    id: 80,
    title: 'et corrupti nihil cumque',
    url: 'https://via.placeholder.com/600/a0c998',
    thumbnailUrl: 'https://via.placeholder.com/150/a0c998'
  },
  {
    albumId: 2,
    id: 81,
    title: 'error magni fugiat dolorem impedit molestiae illo ullam debitis',
    url: 'https://via.placeholder.com/600/31a74c',
    thumbnailUrl: 'https://via.placeholder.com/150/31a74c'
  },
  {
    albumId: 2,
    id: 82,
    title: 'voluptate voluptas molestias vitae illo iusto',
    url: 'https://via.placeholder.com/600/88b703',
    thumbnailUrl: 'https://via.placeholder.com/150/88b703'
  },
  {
    albumId: 2,
    id: 83,
    title: 'quia quasi enim voluptatem repellat sit sint',
    url: 'https://via.placeholder.com/600/a19891',
    thumbnailUrl: 'https://via.placeholder.com/150/a19891'
  },
  {
    albumId: 2,
    id: 84,
    title: 'aliquam dolorem ut modi ratione et assumenda impedit',
    url: 'https://via.placeholder.com/600/b5205d',
    thumbnailUrl: 'https://via.placeholder.com/150/b5205d'
  },
  {
    albumId: 2,
    id: 85,
    title: 'ullam delectus architecto sint error',
    url: 'https://via.placeholder.com/600/eb7e7f',
    thumbnailUrl: 'https://via.placeholder.com/150/eb7e7f'
  },
  {
    albumId: 2,
    id: 86,
    title: 'qui vel ut odio consequuntur',
    url: 'https://via.placeholder.com/600/fd5751',
    thumbnailUrl: 'https://via.placeholder.com/150/fd5751'
  },
  {
    albumId: 2,
    id: 87,
    title: 'eos nihil sunt accusantium omnis',
    url: 'https://via.placeholder.com/600/224566',
    thumbnailUrl: 'https://via.placeholder.com/150/224566'
  },
  {
    albumId: 2,
    id: 88,
    title: 'inventore veritatis magnam enim quasi',
    url: 'https://via.placeholder.com/600/75334a',
    thumbnailUrl: 'https://via.placeholder.com/150/75334a'
  },
  {
    albumId: 2,
    id: 89,
    title: 'id at cum incidunt nulla dolor vero tenetur',
    url: 'https://via.placeholder.com/600/21d35',
    thumbnailUrl: 'https://via.placeholder.com/150/21d35'
  },
  {
    albumId: 2,
    id: 90,
    title: 'et quae eligendi vitae maxime in',
    url: 'https://via.placeholder.com/600/bfe0dc',
    thumbnailUrl: 'https://via.placeholder.com/150/bfe0dc'
  },
  {
    albumId: 2,
    id: 91,
    title: 'sunt quo laborum commodi porro consequatur nam delectus et',
    url: 'https://via.placeholder.com/600/40591',
    thumbnailUrl: 'https://via.placeholder.com/150/40591'
  },
  {
    albumId: 2,
    id: 92,
    title: 'quod non quae',
    url: 'https://via.placeholder.com/600/de79c7',
    thumbnailUrl: 'https://via.placeholder.com/150/de79c7'
  },
  {
    albumId: 2,
    id: 93,
    title: 'molestias et aliquam natus repellendus accusamus dolore',
    url: 'https://via.placeholder.com/600/2edde0',
    thumbnailUrl: 'https://via.placeholder.com/150/2edde0'
  },
  {
    albumId: 2,
    id: 94,
    title: 'et quisquam aspernatur',
    url: 'https://via.placeholder.com/600/cc12f5',
    thumbnailUrl: 'https://via.placeholder.com/150/cc12f5'
  },
  {
    albumId: 2,
    id: 95,
    title: 'magni odio non',
    url: 'https://via.placeholder.com/600/9cda61',
    thumbnailUrl: 'https://via.placeholder.com/150/9cda61'
  },
  {
    albumId: 2,
    id: 96,
    title: 'dolore esse a in eos sed',
    url: 'https://via.placeholder.com/600/1fb08b',
    thumbnailUrl: 'https://via.placeholder.com/150/1fb08b'
  },
  {
    albumId: 2,
    id: 97,
    title: 'labore magnam officiis nemo et',
    url: 'https://via.placeholder.com/600/e2223e',
    thumbnailUrl: 'https://via.placeholder.com/150/e2223e'
  },
  {
    albumId: 2,
    id: 98,
    title: 'sed commodi libero id nesciunt modi vitae',
    url: 'https://via.placeholder.com/600/a77d08',
    thumbnailUrl: 'https://via.placeholder.com/150/a77d08'
  },
  {
    albumId: 2,
    id: 99,
    title: 'magnam dolor sed enim vel optio consequuntur',
    url: 'https://via.placeholder.com/600/b04f2e',
    thumbnailUrl: 'https://via.placeholder.com/150/b04f2e'
  },
  {
    albumId: 2,
    id: 100,
    title: 'et qui rerum',
    url: 'https://via.placeholder.com/600/14ba42',
    thumbnailUrl: 'https://via.placeholder.com/150/14ba42'
  },
  {
    albumId: 3,
    id: 101,
    title: 'incidunt alias vel enim',
    url: 'https://via.placeholder.com/600/e743b',
    thumbnailUrl: 'https://via.placeholder.com/150/e743b'
  },
  {
    albumId: 3,
    id: 102,
    title: 'eaque iste corporis tempora vero distinctio consequuntur nisi nesciunt',
    url: 'https://via.placeholder.com/600/a393af',
    thumbnailUrl: 'https://via.placeholder.com/150/a393af'
  },
  {
    albumId: 3,
    id: 103,
    title: 'et eius nisi in ut reprehenderit labore eum',
    url: 'https://via.placeholder.com/600/35cedf',
    thumbnailUrl: 'https://via.placeholder.com/150/35cedf'
  },
  {
    albumId: 3,
    id: 104,
    title: 'et natus vero quia totam aut et minima',
    url: 'https://via.placeholder.com/600/313b40',
    thumbnailUrl: 'https://via.placeholder.com/150/313b40'
  },
  {
    albumId: 3,
    id: 105,
    title: 'veritatis numquam eius',
    url: 'https://via.placeholder.com/600/eaf2e1',
    thumbnailUrl: 'https://via.placeholder.com/150/eaf2e1'
  },
  {
    albumId: 3,
    id: 106,
    title: 'repellat molestiae nihil iste autem blanditiis officiis',
    url: 'https://via.placeholder.com/600/b1f841',
    thumbnailUrl: 'https://via.placeholder.com/150/b1f841'
  },
  {
    albumId: 3,
    id: 107,
    title: 'maiores ipsa ut autem',
    url: 'https://via.placeholder.com/600/50d332',
    thumbnailUrl: 'https://via.placeholder.com/150/50d332'
  },
  {
    albumId: 3,
    id: 108,
    title: 'qui tempora vel exercitationem harum iusto voluptas incidunt',
    url: 'https://via.placeholder.com/600/627495',
    thumbnailUrl: 'https://via.placeholder.com/150/627495'
  },
  {
    albumId: 3,
    id: 109,
    title: 'quidem ut quos non qui debitis exercitationem',
    url: 'https://via.placeholder.com/600/c5e1ce',
    thumbnailUrl: 'https://via.placeholder.com/150/c5e1ce'
  },
  {
    albumId: 3,
    id: 110,
    title: 'reiciendis et velit laborum recusandae',
    url: 'https://via.placeholder.com/600/2f9e30',
    thumbnailUrl: 'https://via.placeholder.com/150/2f9e30'
  },
  {
    albumId: 3,
    id: 111,
    title: 'quos rem nulla ea amet',
    url: 'https://via.placeholder.com/600/cc178e',
    thumbnailUrl: 'https://via.placeholder.com/150/cc178e'
  },
  {
    albumId: 3,
    id: 112,
    title: 'laudantium quibusdam inventore',
    url: 'https://via.placeholder.com/600/170690',
    thumbnailUrl: 'https://via.placeholder.com/150/170690'
  },
  {
    albumId: 3,
    id: 113,
    title: 'hic nulla consectetur',
    url: 'https://via.placeholder.com/600/1dff02',
    thumbnailUrl: 'https://via.placeholder.com/150/1dff02'
  },
  {
    albumId: 3,
    id: 114,
    title: 'consequatur quaerat sunt et',
    url: 'https://via.placeholder.com/600/e79b4e',
    thumbnailUrl: 'https://via.placeholder.com/150/e79b4e'
  },
  {
    albumId: 3,
    id: 115,
    title: 'unde minus molestias',
    url: 'https://via.placeholder.com/600/da7ddf',
    thumbnailUrl: 'https://via.placeholder.com/150/da7ddf'
  },
  {
    albumId: 3,
    id: 116,
    title: 'et iure eius enim explicabo',
    url: 'https://via.placeholder.com/600/aac33b',
    thumbnailUrl: 'https://via.placeholder.com/150/aac33b'
  },
  {
    albumId: 3,
    id: 117,
    title: 'dolore quo nemo omnis odio et iure explicabo',
    url: 'https://via.placeholder.com/600/b2fe8',
    thumbnailUrl: 'https://via.placeholder.com/150/b2fe8'
  },
  {
    albumId: 3,
    id: 118,
    title: 'et doloremque excepturi libero earum',
    url: 'https://via.placeholder.com/600/eb76bc',
    thumbnailUrl: 'https://via.placeholder.com/150/eb76bc'
  },
  {
    albumId: 3,
    id: 119,
    title: 'quisquam error consequatur',
    url: 'https://via.placeholder.com/600/61918f',
    thumbnailUrl: 'https://via.placeholder.com/150/61918f'
  },
  {
    albumId: 3,
    id: 120,
    title: 'eos quia minima modi cumque illo odit consequatur vero',
    url: 'https://via.placeholder.com/600/3ee01c',
    thumbnailUrl: 'https://via.placeholder.com/150/3ee01c'
  },
  {
    albumId: 3,
    id: 121,
    title: 'commodi sed enim sint in nobis',
    url: 'https://via.placeholder.com/600/fd8ae7',
    thumbnailUrl: 'https://via.placeholder.com/150/fd8ae7'
  },
  {
    albumId: 3,
    id: 122,
    title: 'consequatur quos odio harum alias',
    url: 'https://via.placeholder.com/600/949d2f',
    thumbnailUrl: 'https://via.placeholder.com/150/949d2f'
  },
  {
    albumId: 3,
    id: 123,
    title: 'fuga sint ipsa quis',
    url: 'https://via.placeholder.com/600/ecef3e',
    thumbnailUrl: 'https://via.placeholder.com/150/ecef3e'
  },
  {
    albumId: 3,
    id: 124,
    title: 'officiis similique autem unde repellendus',
    url: 'https://via.placeholder.com/600/bc8f1d',
    thumbnailUrl: 'https://via.placeholder.com/150/bc8f1d'
  },
  {
    albumId: 3,
    id: 125,
    title: 'et fuga perspiciatis qui quis',
    url: 'https://via.placeholder.com/600/d0882c',
    thumbnailUrl: 'https://via.placeholder.com/150/d0882c'
  },
  {
    albumId: 3,
    id: 126,
    title: 'id reiciendis neque voluptas explicabo quae',
    url: 'https://via.placeholder.com/600/7ef62f',
    thumbnailUrl: 'https://via.placeholder.com/150/7ef62f'
  },
  {
    albumId: 3,
    id: 127,
    title: 'magnam quia sed aspernatur',
    url: 'https://via.placeholder.com/600/74456b',
    thumbnailUrl: 'https://via.placeholder.com/150/74456b'
  },
  {
    albumId: 3,
    id: 128,
    title: 'est facere ut nam repellat numquam quia quia eos',
    url: 'https://via.placeholder.com/600/b0931d',
    thumbnailUrl: 'https://via.placeholder.com/150/b0931d'
  },
  {
    albumId: 3,
    id: 129,
    title: 'alias mollitia voluptatum soluta quod',
    url: 'https://via.placeholder.com/600/5efeca',
    thumbnailUrl: 'https://via.placeholder.com/150/5efeca'
  },
  {
    albumId: 3,
    id: 130,
    title: 'maxime provident eaque sapiente ipsa ducimus',
    url: 'https://via.placeholder.com/600/89afb1',
    thumbnailUrl: 'https://via.placeholder.com/150/89afb1'
  },
  {
    albumId: 3,
    id: 131,
    title: 'qui sed ex',
    url: 'https://via.placeholder.com/600/af2618',
    thumbnailUrl: 'https://via.placeholder.com/150/af2618'
  },
  {
    albumId: 3,
    id: 132,
    title: 'repellendus velit id non veniam dolorum quod est',
    url: 'https://via.placeholder.com/600/f9a540',
    thumbnailUrl: 'https://via.placeholder.com/150/f9a540'
  },
  {
    albumId: 3,
    id: 133,
    title: 'placeat in reprehenderit',
    url: 'https://via.placeholder.com/600/f8ee8a',
    thumbnailUrl: 'https://via.placeholder.com/150/f8ee8a'
  },
  {
    albumId: 3,
    id: 134,
    title: 'eveniet perspiciatis optio est qui ea dolore',
    url: 'https://via.placeholder.com/600/496b8d',
    thumbnailUrl: 'https://via.placeholder.com/150/496b8d'
  },
  {
    albumId: 3,
    id: 135,
    title: 'qui harum quis ipsum optio ex',
    url: 'https://via.placeholder.com/600/26016b',
    thumbnailUrl: 'https://via.placeholder.com/150/26016b'
  },
  {
    albumId: 3,
    id: 136,
    title: 'aut voluptas aut temporibus',
    url: 'https://via.placeholder.com/600/2e1c14',
    thumbnailUrl: 'https://via.placeholder.com/150/2e1c14'
  },
  {
    albumId: 3,
    id: 137,
    title: 'et sit earum praesentium quas quis sint et',
    url: 'https://via.placeholder.com/600/41c3dc',
    thumbnailUrl: 'https://via.placeholder.com/150/41c3dc'
  },
  {
    albumId: 3,
    id: 138,
    title: 'vitae delectus sed',
    url: 'https://via.placeholder.com/600/ff79d0',
    thumbnailUrl: 'https://via.placeholder.com/150/ff79d0'
  },
  {
    albumId: 3,
    id: 139,
    title: 'velit placeat optio corrupti',
    url: 'https://via.placeholder.com/600/ff2fe8',
    thumbnailUrl: 'https://via.placeholder.com/150/ff2fe8'
  },
  {
    albumId: 3,
    id: 140,
    title: 'assumenda sit non debitis dolorem saepe quae deleniti',
    url: 'https://via.placeholder.com/600/c0798a',
    thumbnailUrl: 'https://via.placeholder.com/150/c0798a'
  },
  {
    albumId: 3,
    id: 141,
    title: 'commodi eum dolorum reiciendis unde ut',
    url: 'https://via.placeholder.com/600/b13ff6',
    thumbnailUrl: 'https://via.placeholder.com/150/b13ff6'
  },
  {
    albumId: 3,
    id: 142,
    title: 'reprehenderit totam dolor itaque',
    url: 'https://via.placeholder.com/600/c7a96d',
    thumbnailUrl: 'https://via.placeholder.com/150/c7a96d'
  },
  {
    albumId: 3,
    id: 143,
    title: 'totam temporibus eaque est eum et perspiciatis ullam',
    url: 'https://via.placeholder.com/600/79439b',
    thumbnailUrl: 'https://via.placeholder.com/150/79439b'
  },
  {
    albumId: 3,
    id: 144,
    title: 'aspernatur possimus consectetur in tempore distinctio a ipsa officiis',
    url: 'https://via.placeholder.com/600/66a752',
    thumbnailUrl: 'https://via.placeholder.com/150/66a752'
  },
  {
    albumId: 3,
    id: 145,
    title: 'eius unde ipsa incidunt corrupti quia accusamus omnis',
    url: 'https://via.placeholder.com/600/f3472e',
    thumbnailUrl: 'https://via.placeholder.com/150/f3472e'
  },
  {
    albumId: 3,
    id: 146,
    title: 'ullam dolor ut ipsa veniam',
    url: 'https://via.placeholder.com/600/6c746e',
    thumbnailUrl: 'https://via.placeholder.com/150/6c746e'
  },
  {
    albumId: 3,
    id: 147,
    title: 'minima aspernatur eius nemo ut',
    url: 'https://via.placeholder.com/600/661f4c',
    thumbnailUrl: 'https://via.placeholder.com/150/661f4c'
  },
  {
    albumId: 3,
    id: 148,
    title: 'aperiam amet est occaecati quae non ut',
    url: 'https://via.placeholder.com/600/b9d67e',
    thumbnailUrl: 'https://via.placeholder.com/150/b9d67e'
  },
  {
    albumId: 3,
    id: 149,
    title: 'saepe recusandae ut odio enim ipsa quo placeat iusto',
    url: 'https://via.placeholder.com/600/cffa9b',
    thumbnailUrl: 'https://via.placeholder.com/150/cffa9b'
  },
  {
    albumId: 3,
    id: 150,
    title: 'ipsum numquam ratione facilis provident animi reprehenderit ut',
    url: 'https://via.placeholder.com/600/3689cd',
    thumbnailUrl: 'https://via.placeholder.com/150/3689cd'
  }
];

describe('/albums GET', () => {
  it('should successfully return the albums', done => {
    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .reply(200, albums, { 'Content-Type': 'application/json' });
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .get('/albums')
          .set('token', token)
          .send()
          .then(res => {
            expect(res.body).to.be.an('array');
            res.body.forEach(album => {
              expect(album).to.have.property('userId');
              expect(album).to.have.property('id');
              expect(album).to.have.property('title');
            });
            res.should.have.status(200);
            dictum.chai(res);
            n.done();
            done();
          })
      )
    );
  });

  it('should fail because nock is configured to do so', done => {
    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .replyWithError('Not Found');
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .get('/albums')
          .set('token', token)
          .send()
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.RESOURCE_NOT_FOUND);
            should.equal(e.status, 404);
            expect(e.response.body.message).to.equal(errorMessages.albumsNotAvailable);
            n.done();
            done();
          })
      )
    );
  });
});

describe('/albums/:id POST', () => {
  it('should successfully purchase album', done => {
    const albumIdToBuy = 1;

    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' });

    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post(`/albums/${albumIdToBuy}`)
          .set('token', token)
          .send()
          .then(res => {
            res.should.have.status(201);
            expect(res.body).to.have.property('albumId');
            expect(res.body.albumId).to.equal(albumIdToBuy);
            n.done();
            done();
          })
      )
    );
  });

  it('should fail to purchase album because it was purchased already', done => {
    const albumIdToBuy = 1;

    const nocks = [...Array(2)].map(() =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumIdToBuy })
        .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        testHelpers.purchaseAlbum(albumIdToBuy, token).then(() =>
          testHelpers.purchaseAlbum(albumIdToBuy, token).catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message).to.equal(errorMessages.albumAlreadyPurchased);
            nocks.forEach(n => n.done());
            done();
          })
        )
      )
    );
  });

  it('should fail to purchase album because the token was not present', done => {
    chai
      .request(server)
      .post(`/albums/1`)
      .send()
      .catch(e => {
        e.response.should.have.status(400);
        expect(e.response.body.message[0]).to.equal(errorMessages.tokenIsRequired);
        done();
      });
  });

  it('should fail to purchase album because the token is invalid', done => {
    chai
      .request(server)
      .post(`/albums/1`)
      .set('token', 'someinvalidtoken')
      .send()
      .catch(e => {
        e.response.should.have.status(400);
        expect(e.response.body.message).to.equal(errorMessages.invalidToken);
        done();
      });
  });

  it('should fail to purchase album because id is not a number', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/albums/asd')
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message[0]).to.equal(errorMessages.albumIdMustBeNumber);
            done();
          })
      )
    );
  });

  it('should fail to purchase album because id is non existent', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/albums/99999')
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(404);
            expect(e.response.body.message).to.equal(errorMessages.albumNotAvailable);
            done();
          })
      )
    );
  });
});

describe('/users/:userId/albums GET', () => {
  it('should list purchasedAlbums', done => {
    const albumIdToBuy = 1;
    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' });

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        testHelpers.purchaseAlbum(albumIdToBuy, token).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(1);
              expect(r.body[0].albumId).to.equal(albumIdToBuy);
              done();
            })
        )
      );
    });
  });

  it('should list the two albums that were purchased', done => {
    const albumIdsToBuy = [1, 2];

    const nocks = albumIdsToBuy.map(albumId =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumId })
        .reply(200, [albums.find(a => a.id === albumId)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        Promise.all(albumIdsToBuy.map(albumId => testHelpers.purchaseAlbum(albumId, token))).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(albumIdsToBuy.length);
              expect(r.body.map(i => i.albumId)).to.containSubset(albumIdsToBuy);
              nocks.forEach(n => n.done());
              done();
            })
        )
      );
    });
  });

  it('should fail because the token is required', done => {
    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/${id}/albums`)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message[0]).to.equal(errorMessages.tokenIsRequired);
            done();
          })
      );
    });
  });

  it('should list no purchasedAlbums because no album has been purchased', done => {
    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/${id}/albums`)
          .set('token', token)
          .send()
          .then(r => {
            r.should.have.status(200);
            expect(r.body.length).to.equal(0);
            done();
          })
      );
    });
  });
});

describe('/users/albums/:id/photos GET', () => {
  it('should list the purchased album photos', done => {
    const albumIdToBuy = 1;
    const albumToBuyPhotos = albumsPhotos.filter(a => a.albumId === albumIdToBuy);
    const albumNock = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' })
      .persist();

    const albumPhotosNock = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PHOTOS_PATH)
      .query({ albumId: albumIdToBuy })
      .reply(200, albumToBuyPhotos, {
        'Content-Type': 'application/json'
      });

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        testHelpers.purchaseAlbum(albumIdToBuy, token).then(() =>
          chai
            .request(server)
            .get(`/users/albums/${albumIdToBuy}/photos`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(albumToBuyPhotos.length);
              r.body.forEach(photo => {
                expect(photo).to.have.property('albumId');
                expect(photo).to.have.property('title');
                expect(photo).to.have.property('url');
                expect(photo).to.have.property('thumbnailUrl');
                expect(photo).to.have.property('id');
              });

              albumNock.persist(false);
              albumPhotosNock.done();

              done();
            })
        )
      );
    });
  });

  it('should fail because the album was not purchased', done => {
    const notBoughtAlbumId = 1;
    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/albums/${notBoughtAlbumId}/photos`)
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message).to.equal(errorMessages.youCanOnlyViewPhotosOfYourPurchasedAlbums);
            done();
          })
      );
    });
  });

  it('should fail because the album is inexistent', done => {
    const albumIdToBuy = 1;
    const albumNock = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' });

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/albums/${id}/photos`)
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message).to.equal(errorMessages.youCanOnlyViewPhotosOfYourPurchasedAlbums);
            albumNock.done();
            done();
          })
      );
    });
  });
});
