from .func import DEFAULT_FUNC

from pathlib import Path
from PandaConfig import PandaConfig as _PandaConfig
from typing import Callable


class Configure(_PandaConfig):
    
    @staticmethod
    def default_func():
        return DEFAULT_FUNC
    
    def __init__(self, 
		conf_path: str | Path, 
  		config_func: dict[str, tuple[Callable, int]] = {}
    ):
        super().__init__(conf_path, config_func | self.default_func())
        self.registration('conf_dir', 0)(lambda: str(Path(self.conf_path).parent.absolute()))
        self.registration('conf_path', 0)(lambda: str(Path(self.conf_path).absolute()))
        