import { Input } from "./input";

import { addItem } from "../reducer";

export function Header() {
    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <Input onSubmit={addItem} label="New Todo Input" placeholder="What needs to be done?" />
        </header>
    );
}
