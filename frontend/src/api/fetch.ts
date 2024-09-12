export async function fetchClient<TData>(
	url: string,
	method: "POST" | "GET" | "DELETE" | "PUT",
	body?: object | null,
	userId?: string,
) {
	const response = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			Authorization: `${userId}`,
		},
		body: body && JSON.stringify(body),
	});

	const responseJson = await response.json();

	if (!response.ok) {
		return new RequestResponse<TData>(true, responseJson);
	}

	return new RequestResponse<TData>(false, responseJson);
}

export class RequestResponse<TData> {
	public fetchedData: TData | null;
	public messages: string[] = [];
	public code = 500;

	constructor(
		public hasError: boolean,
		data: TData | unknown,
	) {
		if (hasError) {
			this.fetchedData = null;
			this.hanldeError(data);
		} else {
			this.fetchedData = data as TData;
		}
	}

	toPlainObject() {
		if (this.hasError) {
			return {
				error: true,
				code: this.code,
				messages: this.messages,
			};
		}

		return {
			error: false,
			data: this.fetchedData,
		};
	}

	private hanldeError(error: unknown) {
		if (error) {
			if (typeof error === "object") {
				if ("message" in error) {
					if (typeof error.message === "string") {
						this.messages.push(error.message);
					} else {
						this.messages = error.message as string[];
					}
				}

				if ("statusCode" in error) {
					this.code = error.statusCode as number;
				}
			}
		}
	}
}
