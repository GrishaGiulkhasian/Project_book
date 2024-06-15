// Мы ожидаем, что Вы исправите синтаксические ошибки, сделаете перехват возможных исключений и улучшите читаемость кода.
// А так же, напишите кастомный хук useThrottle и используете его там где это нужно.
// Желательно использование React.memo и React.useCallback там где это имеет смысл.
// Будет большим плюсом, если Вы сможете закэшировать получение случайного пользователя.
// Укажите правильные типы.
// По возможности пришлите Ваш вариант в https://codesandbox.io

import React, { useState, useCallback } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

// Объявление 2 пользовательских типов данных: Company и User

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any;
};

interface IButtonProps {
  // any не самый лучший тип для использования поэтому поменял на void
  onClick: () => void;
}
// Добавил React.memo для оптимизации 
// Тут создается функциональный компонент Button, который принимает 
//пропс onClick, представляющий собой функцию без аргументов и возвращающую void
const Button: React.FC<IButtonProps> = React.memo(({ onClick }) => {
  return (
    <button type="button" onClick={onClick}>
      get random user
    </button>
  );
});

interface IUserInfoProps {
  user: User;
}
// Добавил React.memo для оптимизации 
// Этот компонент отображает информацию о пользователе в виде таблицы. 
//Он принимает объект user в качестве свойства и отображает его имя и номер телефона.
const UserInfo: React.FC<IUserInfoProps> = React.memo(({ user }) => {
  return (
    // убрал table поставил div потому что не вижу смысла в использовании таблиц
    <div> 
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </div>
  );
});
// кастомный хук
//Этот хук позволяет задерживать вызов функции на определенный интервал времени. 
//Он использует useRef для отслеживания времени последнего вызова функции и useCallback для создания мемоизированной версии функции с задержкой.
function useThrottle(callback: () => void, delay: number) {
  const throttledCallback = useCallback(callback, []);
  const lastRan = React.useRef(Date.now());
  return useCallback(() => {
    const now = Date.now();
    if (now - lastRan.current >= delay) {
      lastRan.current = now;
      throttledCallback();
    }
  }, [throttledCallback, delay]);
}

//Этот компонент является основным компонентом приложения. 
//Он использует состояние item, чтобы хранить информацию о пользователях. 
//При нажатии на кнопку "Get a random user" вызывается функция handleButtonClick, которая запускает получение случайного пользователя с задержкой.
function App(): JSX.Element {
//null
  const [item, setItem] = useState<Record<number, User>>({});

  const receiveRandomUser = async () => {
    const id = Math.floor(Math.random() * (10 - 1)) + 1;
    const response = await fetch(`${URL}/${id}`);
    const user = (await response.json()) as User;
    setItem((prevItems) => ({ ...prevItems, [id]: user }));
  };
// задержка
  const delayedReceiveRandomUser = useThrottle(receiveRandomUser, 1000);
// вызов кнопки
  const handleButtonClick = () => {
    delayedReceiveRandomUser();
  };

  return (
    <div>
      <header>Get a random user</header>
      <Button onClick={handleButtonClick} />
      <UserInfo user={item[Math.floor(Math.random() * (10 - 1)) + 1] || {}} />
    </div>
  );
}

export default App;

// Ошибки: 
// 1. interface IButtonProps {
//   // any не самый лучший тип для использования поэтому поменял на void
//   onClick: () => void;
// } не то чтобы ошибка, но так лучше
// 2.function App(): JSX.Element {
//   const [item, setItem] = useState<Record<number, User>>(null);
//   из-за налл вообще не работает,
//   В данном случае, использование пустого объекта в качестве начального значения для item позволяет мне добавлять пользователей 
//   с их уникальными идентификаторами в объект item. Когда я получаю случайного пользователя с определенным идентификатором, 
//   я добавляю его в объект item с ключом, соответствующим этому идентификатору